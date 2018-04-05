let filterConfig = {createdAt: new Date(''), author: '', hashtags: []};

let currentCountOfPosts = 10;
let answer = '';
let arrayOfAccounts = [
    {login: 'Прищеп Максим', password: 'qwerty'},
    {login: 'Валай Александр', password: '12345'}
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

    function likePost(e) {
        if (user !== null && event.target.classList.contains('like')) {
            if (modul.likePost(this.id)) {
                dom.likePost(this.id);
            }
            else {
                dom.unlikePost(this.id);
            }
            localStorage.setItem('array', JSON.stringify(photoPosts));
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
            dialog.showModal();
            localStorage.setItem('array', JSON.stringify(photoPosts));
        }
    }

    function exit() {
        user = null;
        dom.checkUser();
        dom.initPAge();

    }

    let eNothingToShow = function () {
        let dialog = document.getElementById('window-nothing-to-show');
        dialog.showModal();
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
                user = login;
                currentCountOfPosts = 10;
                dom.initPage();
                flag = true;
            }
        })

        if (!flag) {
            document.getElementById('wrong-login-or-password').showModal();
        }

    }

    let eClickAddButton = function (addPhoto) {
        addPhoto.addEventListener('click', function () {
            //alert('Hello!!!');
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

        dropArea.addEventListener("drop", function (event) {
            event.preventDefault();
            let files = event.dataTransfer.files;
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

    let clickDoneButton = function (post, newPost, imgDropArea, incorrectInform, date, buttonDone, textAreaHash, textAreaDescr) {
        function generateUniqId() {
            let ID = 1;
            for (let i = 0; i < photoPosts.length; i++) {
                for (let j = 0; j < photoPosts.length; j++) {
                    if (photoPosts[j].id == ID) {
                        ID++;
                        break;
                    }

                }
            }
            return ID.toString();
        }

        function clickDone() {
            if (post !== null) {
                newPost.description = textAreaDescr.value;
                if (textAreaHash.value !== '') {
                    let tmp = textAreaHash.value.split(' ');
                    newPost.hashtags = tmp;
                }
                else
                    newPost.hashtags = [];

                newPost.photoLink = imgDropArea.getAttribute('src');
                newPost.likes = post.likes;
                if (modul.editPhotoPost(post.id.toString(), newPost)) {
                    localStorage.setItem('array', JSON.stringify(photoPosts));
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
                newPost.photoLink = imgDropArea.getAttribute('src');
                newPost.description = textAreaDescr.value;
                if (textAreaHash.value !== '') {
                    let tmp = textAreaHash.value.split(' ');
                    newPost.hashtags = tmp;
                }
                else
                    newPost.hashtags = [];

                newPost.likes = [];
                if (modul.addPhotoPost(newPost)) {
                    localStorage.setItem('array', JSON.stringify(photoPosts));
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