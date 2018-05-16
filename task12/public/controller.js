let filterConfig = { createdAt: new Date(''), author: '', hashtags: [] };
let currentCountOfPosts = 10;
let answer = '';
let srcPath = '';
const arrayOfAccounts = [
    { login: 'Прищеп Максим', password: 'qwerty' },
    { login: 'Валай Александр', password: '12345' },
    { login: 'Никифоров Никита', password: '12345' },
    { login: 'Гаврушко Дмитрий', password: '12345' },
];
let events = (function () {
    async function likePost(event) {
        if (user !== null && event.target.classList.contains('like')) {
            let flag = await model.likePost(this.id);
            console.log(flag);
            if (flag === 'true') {
                dom.likePost(this.id);
            } else if (flag === 'false') {
                dom.unlikePost(this.id);
            }
        }
    }
    let eLikePost = function (post) {
        post.addEventListener('click', likePost);
    };

    function showPhotoPosts(skip, top, filterConfigParam) {
        dom.showPhotoPosts(skip, top, filterConfigParam);
    }
    let eShowMorePhotoPosts = function () {
        currentCountOfPosts += 10;

        showPhotoPosts(0, currentCountOfPosts, filterConfig);
    };

    function deletePost(event) {
        if (user !== null && event.target.classList.contains('del')) {
            let index = this.id;
            let dialog = document.getElementById('window-confirm-delete');
            dialog.addEventListener('close', function () {
                answer = this.returnValue;
                if (answer === 'Yes') {
                    dom.removePhotoPost(index, 0, currentCountOfPosts, filterConfig);
                    dom.initPage();
                }
            }, false);
            dom.drawWindow('window-confirm-delete');
        }
    }
    let eDeletePost = function (post) {
        post.addEventListener('click', deletePost);
    };

    async function exit() {
        let flag = await model.logOut();
        if (flag){
            user = null;
            dom.checkUser();
            dom.initPage();
        }
    }


    function clickSignIn() {
        dom.drowSignInPage();
    }
    let eExit = function (elem) {
        elem.addEventListener('click', exit);
    };

    let eClickSignIn = function (button) {
        button.addEventListener('click', clickSignIn);
    };

    let eFiltr = function (author, date, tags) {
        if (filterConfig.author === '' && filterConfig.hashtags === [] && filterConfig.createdAt === 'Invalid Date') {
            dom.initPage();
        }

        let tagArray = tags.split(' ');
        currentCountOfPosts = 0;
        filterConfig.author = author;
        filterConfig.hashtags = tagArray;
        filterConfig.createdAt = new Date(date);
        eShowMorePhotoPosts();
    };

    let eNothingToShow = function () {
        dom.drawWindow('window-nothing-to-show');
    };

    let eSignIn = async function (login, password) {
        let flag = await model.logIn(login, password);
        if (flag !== 'false'){
            document.getElementsByTagName('nav')[0].style.display = 'block';
            document.getElementById('aut-sug').value = '';
            document.getElementById('date').value = '';
            document.getElementById('tags').value = '';
            filterConfig.createdAt = new Date('');
            filterConfig.author = '';
            filterConfig.hashtags = [];
            user = login;
            currentCountOfPosts = 10;
            dom.initPage();
        }
        else {
            dom.drawWindow('wrong-login-or-password');
        }
    };

    let eClickAddButton = function (addPhoto) {
        addPhoto.addEventListener('click', function () {
            dom.drawEdit();
        });
    };

    let dragAndDrop = function (dropArea, incorrectPhotoP, imgDropArea) {
        let incorrectPhoto = incorrectPhotoP;
        function validFileType(file) {
            let fileTypes = [
                'image/jpeg',
                'image/img',
                'image/png',
                'image/jpg',
            ];

            for (let i = 0; i < fileTypes.length; i++) {
                if (file.type === fileTypes[i]) {
                    return true;
                }
            }
            return false;
        }

        dropArea.addEventListener('dragover', function (event) {
            event.preventDefault();
        }, false);

        dropArea.addEventListener('drop', async function (event) {
            event.preventDefault();
            let files = event.dataTransfer.files;
            srcPath = await model.downloadFile(files[0]);
            let reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onloadend = function () {
                if (validFileType(files[0])) {
                    incorrectPhoto.innerHTML = '';
                    imgDropArea.setAttribute('src', reader.result);
                } else {
                    incorrectPhoto.innerHTML = 'Incorrect type of photo';
                }
            };
        }, false);

        function highlight() {
            dropArea.classList.add('highlight');
        }

        function unhighlight() {
            dropArea.classList.remove('highlight');
        }
        ['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, highlight, false));

        ['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, unhighlight, false));
    };

    let clickDoneButton = async function (p, newPP, imgDropArea, infP, date, bDone, tHash, tDescr) {
        let posts = await model.getPhotoPosts(0, await model.getPhotoPostArraySize());
        let newPost = newPP;
        let incInf = infP;
        function generateUniqId() {
            let ID = 1;
            for (let i = 0; i < posts.length; i++) {
                for (let j = 0; j < posts.length; j++) {
                    if (Number(posts[j].id) === ID) {
                        ID++;
                        break;
                    }
                }
            }
            return ID.toString();
        }

        async function clickDone() {
            if (p !== null) {
                newPost.description = tDescr.value;
                if (tHash.value !== '') {
                    let tmp = tHash.value.split(' ');
                    newPost.hashtags = tmp;
                } else {
                    newPost.hashtags = [];
                }

                newPost.photoLink = srcPath;
                newPost.likes = p.likes;
                let flag = await model.editPhotoPost(p.id.toString(), newPost);
                if (flag) {
                    dom.initPage();
                } else {
                    incInf.textContent = 'Wrong data!!!';
                }
            } else {
                newPost.id = generateUniqId();
                newPost.author = user;
                newPost.createdAt = date;


                newPost.photoLink = srcPath;
                newPost.description = tDescr.value;
                if (tHash.value !== '') {
                    let tmp = tHash.value.split(' ');
                    newPost.hashtags = tmp;
                } else newPost.hashtags = [];

                newPost.likes = [];
                let flag = await model.addPhotoPost(newPost);
                if (flag) {
                    dom.initPage();
                } else {
                    incInf.textContent = 'Wrong data!!!';
                }
            }
        }

        bDone.addEventListener('click', clickDone);
    };

    let clickEdit = function (edit, post) {
        edit.addEventListener('click', function () {
            dom.drawEdit(post);
        });
    };

    function tmpFunc() {
        return 0;
    }

    return {
        eLikePost,
        eShowMorePhotoPosts,
        eDeletePost,
        eExit,
        eFiltr,
        eNothingToShow,
        eClickSignIn,
        eSignIn,
        eClickAddButton,
        dragAndDrop,
        clickDoneButton,
        clickEdit,
        tmpFunc,
    };
}());
events.tmpFunc();

