let filterConfig = {createdAt: new Date(''), author: '', hashtags: []};

let currentCountOfPosts = 10;
let answer = '';
let srcPath = '';
let arrayOfAccounts = [
    {login: 'Прищеп Максим', password: 'qwerty'},
    {login: 'Валай Александр', password: '12345'},
    {login: 'Никифоров Никита', password: '12345'},
    {login: 'Гаврушко Дмитрий', password: '12345'}
];
let events = (function () {
    let eLikePost = function (post) {
        post.addEventListener('click', likePost);
    };

    let eShowMorePhotoPosts = function () {
        currentCountOfPosts += 10;

        showPhotoPosts(0, currentCountOfPosts, filterConfig);
    };

    let eDeletePost = function (post) {
        post.addEventListener('click', deletePost);
    }

    let eExit = function (elem) {
        elem.addEventListener('click', exit);
    }

    let eClickSignIn = function (button) {
        button.addEventListener('click', clickSignIn);
    }

    let eFiltr = function (author, date, tags) {
        if (filterConfig.author === '' && filterConfig.hashtags === [] && filterConfig.createdAt == 'Invalid Date') {
            dom.initPage;
        }

        let tagArray = tags.split(' ');
        currentCountOfPosts = 0;
        filterConfig.author = author;
        filterConfig.hashtags = tagArray;
        filterConfig.createdAt = new Date(date);
        eShowMorePhotoPosts();
    }

    function clickSignIn() {
        dom.drowSignInPage();
    }

    function showPhotoPosts(skip, top, filterConfig) {
        dom.showPhotoPosts(skip, top, filterConfig);
    }

    async function likePost(e) {
        if (user !== null && event.target.classList.contains('like')) {
            let flag = await model.likePost(this.id);
            console.log(flag);
            if (flag === 'true') {
                dom.likePost(this.id);
            }
            else if (flag === 'false') {
                dom.unlikePost(this.id);
            }
        }
    }

    function deletePost(e) {
        if (user !== null && event.target.classList.contains('del')) {
            let index = this.id;
            let dialog = document.getElementById('window-confirm-delete');
            dialog.addEventListener('close', function (e) {
                answer = this.returnValue;
                if (answer === 'Yes') {
                    dom.removePhotoPost(index, 0, currentCountOfPosts, filterConfig);
                    dom.initPage();
                }

            }, false);
            dom.drawWindow('window-confirm-delete');
        }
    }

    async function exit() {
        //await model.setUser(null)
        user = null;
        dom.checkUser();
        dom.initPage();
    }

    let eNothingToShow = function () {
        dom.drawWindow('window-nothing-to-show');
    }

    let eSignIn = function (login, password) {
        let flag = false;
        arrayOfAccounts.forEach(function (item, i, arr) {
            if (item.login === login && item.password === password) {
                document.getElementsByTagName('nav')[0].style.display = 'block';
                document.getElementById('aut-sug').value = '';
                document.getElementById('date').value = '';
                document.getElementById('tags').value = '';
                filterConfig.createdAt = new Date('');
                filterConfig.author = '';
                filterConfig.hashtags = [];
                //model.setUser(login);
                user = login;
                currentCountOfPosts = 10;
                dom.initPage();
                flag = true;
            }
        })

        if (!flag) {
            dom.drawWindow('wrong-login-or-password');
        }

    }

    let eClickAddButton = function (addPhoto) {
        addPhoto.addEventListener('click', function () {
            dom.drawEdit();
        });
    };

    let dragAndDrop = function (dropArea, incorrect_photo, imgDropArea) {
        function validFileType(file) {
            let fileTypes = [
                'image/jpeg',
                'image/img',
                'image/png',
                'image/jpg'
            ];

            for (let i = 0; i < fileTypes.length; i++) {
                if (file.type === fileTypes[i]) {
                    return true;
                }
            }
            return false;
        }

        dropArea.addEventListener("dragover", function (event) {
            event.preventDefault();
        }, false);

        dropArea.addEventListener("drop",async function (event) {
            event.preventDefault();
            let files = event.dataTransfer.files;
            srcPath = await model.downloadFile(files[0]);
            let reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onloadend = function () {
                if (validFileType(files[0])) {
                    incorrect_photo.innerHTML = '';
                    imgDropArea.setAttribute('src', reader.result);
                }
                else
                    incorrect_photo.innerHTML = 'Incorrect type of photo';

            };
        }, false);

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        })

        function highlight(e) {
            dropArea.classList.add('highlight')
        }

        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }
    };

    let clickDoneButton = async function (post, newPost, imgDropArea, incorrectInform, date, buttonDone, textAreaHash, textAreaDescr) {
        let posts = await model.getPhotoPosts(0, await model.getPhotoPostArraySize());

        function generateUniqId() {
            let ID = 1;
            for (let i = 0; i < posts.length; i++) {
                for (let j = 0; j < posts.length; j++) {
                    if (posts[j].id == ID) {
                        ID++;
                        break;
                    }

                }
            }
            return ID.toString();
        }

        async function clickDone() {
            if (post !== null) {
                newPost.description = textAreaDescr.value;
                if (textAreaHash.value !== '') {
                    let tmp = textAreaHash.value.split(' ');
                    newPost.hashtags = tmp;
                }
                else
                    newPost.hashtags = [];

                newPost.photoLink = srcPath;
                newPost.likes = post.likes;
                let flag = await model.editPhotoPost(post.id.toString(), newPost);
                if (flag) {
                    dom.initPage();
                }
                else {
                    incorrectInform.textContent = 'Wrong data!!!';
                }
            }
            else {
                newPost.id = generateUniqId();
                newPost.author = user;
                newPost.createdAt = date;


                newPost.photoLink = srcPath;
                newPost.description = textAreaDescr.value;
                if (textAreaHash.value !== '') {
                    let tmp = textAreaHash.value.split(' ');
                    newPost.hashtags = tmp;
                }
                else
                    newPost.hashtags = [];

                newPost.likes = [];
                let flag = await model.addPhotoPost(newPost);
                if (flag) {
                    dom.initPage();
                }
                else {
                    incorrectInform.textContent = 'Wrong data!!!';
                }
            }

        }

        buttonDone.addEventListener('click', clickDone);
    };

    let clickEdit = function (edit, post) {
        edit.addEventListener('click', function () {
            dom.drawEdit(post);
        });

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
        clickEdit
    }
})();