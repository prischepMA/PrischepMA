let user = null;

let dom = (function () {
    function showPhotoPost(post) {
        let photoTable = document.body.getElementsByTagName('section')[0];

        let сell = document.createElement('article');
        сell.setAttribute('id', post.id);

        let authorName = document.createElement('div');
        authorName.className = 'auther-name';
        authorName.innerHTML = post.author;

        let dateAndTime = document.createElement('div');
        dateAndTime.className = 'date-and-time';
        dateAndTime.innerHTML = ('0' + post.createdAt.getDate()).slice(-2) +
            '.' + ('0' + (post.createdAt.getMonth() + 1)).slice(-2) +
            '.' + post.createdAt.getFullYear();

        let image = document.createElement('img');
        image.className = 'image-inside';
        image.setAttribute('src', post.photoLink);

        let imgRedact = document.createElement('img');
        let imgLikes = document.createElement('img');
        let imgDelete = document.createElement('img');
        imgRedact.className = 'redact';
        imgLikes.className = 'like';
        imgDelete.className = 'del';
        imgLikes.setAttribute('src', 'img/like.png');
        if (post.author === user) {
            imgDelete.setAttribute('src', 'img/del.png');

            imgRedact.setAttribute('src','img/redact.png');
        }

        let backUnderPhoto = document.createElement('div');
        backUnderPhoto.className = 'back-under-photo';

        let tags = document.createElement('div');
        tags.className = 'tags';


        if (post.hashtags !== undefined) {
            tags.innerHTML = post.hashtags.join('');
        }


        let description = document.createElement('div');
        description.className = 'description';
        description.innerHTML = post.description;


        сell.appendChild(authorName);
        сell.appendChild(dateAndTime);
        сell.appendChild(image);

        if (user === post.author) {
            сell.appendChild(imgRedact);
        }

        сell.appendChild(imgLikes);

        if (user === post.author) {
            сell.appendChild(imgDelete);
        }

        backUnderPhoto.appendChild(tags);
        backUnderPhoto.appendChild(description);
        сell.appendChild(backUnderPhoto);
        photoTable.appendChild(сell);
    };

    let showPhotoPosts = function (skip, top, filterCofig) {
        document.body.getElementsByTagName('section')[0].innerHTML = '';
        let array = modul.getPhotoPosts(skip, top, filterCofig);
        for (let i = 0; i < array.length; i++) {
            showPhotoPost(array[i]);
        }
    }

    let checkUser = function () {
        document.querySelector('header').innerText = '';

        if (user) {
            let addPhoto = document.createElement('div');
            addPhoto.className = 'button-in-header';
            addPhoto.id = 'add-new-photo';

            let button = document.createElement('a');
            button.className = 'button30';
            button.innerHTML = '+';

            let inscription = document.createElement('p');
            inscription.id = 'add-photo';
            inscription.innerHTML = 'Add photo';

            addPhoto.appendChild(button);
            addPhoto.appendChild(inscription);

            let exitBlock = document.createElement('div');
            exitBlock.className = 'button-in-header';
            exitBlock.id = 'exit';

            let exitButton = document.createElement('button');
            exitButton.className = 'button-head';
            exitButton.innerHTML = 'Exit';

            exitBlock.appendChild(exitButton);

            let userName = document.createElement('div');
            userName.className = 'button-in-header';
            userName.id = 'user-name';
            userName.innerHTML = user;

            document.querySelector('header').appendChild(addPhoto);
            document.querySelector('header').appendChild(exitBlock);
            document.querySelector('header').appendChild(userName);
        }
        else {
            let signInBlock = document.createElement('div');
            signInBlock.className = 'button-in-header';
            signInBlock.id = 'sign-in';

            let signInButton = document.createElement('button');
            signInButton.className = 'button-head';
            signInButton.innerHTML = 'Sign in';

            signInBlock.appendChild(signInButton);

            document.querySelector('header').appendChild(signInBlock);
        }
    }

    let removePhotoPost = function (id, skip, top, filterConfig) {
        if (modul.removePhotoPost(id.toString())) {
            showPhotoPosts(skip, top, filterConfig);
        }
    }

    let addPhotoPost = function (post, skip, top, filterConfig) {
        if (modul.addPhotoPost(post)) {
            display(skip, top, filterConfig);
        }
    }

    let editPhotoPost = function (id, post, skip, top, filterConfig) {
        if (modul.editPhotoPost(id.toString(), post)) {
            display(skip, top, filterConfig);
        }
    }

    function setAuthorInit() {
        let authorSet = new Set();
        for (let i = 0; i < photoPosts.length; i++) {
            authorSet.add(photoPosts[i].author);
        }

        let options = '';
        for (let item of authorSet) {
            options += '<option value=\"' + item + '\">\n';
        }
        document.getElementById('author-suggestions').innerHTML = options;
    }

    function setHashTagInit() {
        let hashTagsSet = new Set();
        for (let i = 0; i < photoPosts.length; i++) {
            if (photoPosts[i].hashtags !== undefined) {
                for (let j = 0; j < photoPosts[i].hashtags.length; j++) {
                    hashTagsSet.add(photoPosts[i].hashtags[j]);
                }
            }
        }

        let options = '';
        for (let item of hashTagsSet) {
            options += '<option value=' + item + '>\n';
        }
        document.getElementById('tag-suggestions').innerHTML = options;
    }

    return {
        showPhotoPosts,
        removePhotoPost,
        addPhotoPost,
        editPhotoPost,
        checkUser,
        setAuthorInit,
        setHashTagInit
    }
}());

function display(skip, top, filterConfig) {
    dom.showPhotoPosts(skip, top, filterConfig);
}

function addPost(post, skip, top, filterConfig) {
    dom.addPhotoPost(post, skip, top, filterConfig)
}

function removePost(id, skip, top, filterConfig) {
    dom.removePhotoPost(id, skip, top, filterConfig);
}

function editPost(id, post, skip, top, filterConfig) {
    dom.editPhotoPost(id, post, skip, top, filterConfig)
}

function addAuthorSuggestions() {
    dom.setAuthorInit();
}

function addTagsSuggestions() {
    dom.setHashTagInit();
}

dom.checkUser();

//тетсты
//display(0, 20)
//display(0, 20, { hashtags: ['#friends']})
//editPost('1', {description: 'Hello', hashtags: ['#summer']})
//removePost(1,0,20)
//addPost(CorrectPost,0,20)