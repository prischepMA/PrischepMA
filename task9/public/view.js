let user = null;

let dom = (function () {
    function checkUser() {
        document.querySelector('header').textContent = '';
        if (user) {
            let addPhoto = document.createElement('div');
            addPhoto.className = 'button-in-header';
            addPhoto.id = 'add-new-photo';

            let button = document.createElement('a');
            button.className = 'button30';
            button.textContent = '+';

            events.eClickAddButton(button);

            let inscription = document.createElement('p');
            inscription.id = 'add-photo';
            inscription.textContent = 'Add photo';

            addPhoto.appendChild(button);
            addPhoto.appendChild(inscription);

            let exitBlock = document.createElement('div');
            exitBlock.className = 'button-in-header';
            exitBlock.id = 'exit';

            let exitButton = document.createElement('button');
            exitButton.className = 'button-head';
            exitButton.textContent = 'Exit';
            events.eExit(exitButton);


            exitBlock.appendChild(exitButton);

            let userName = document.createElement('div');
            userName.className = 'button-in-header';
            userName.id = 'user-name';
            userName.textContent = user;

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
            signInButton.textContent = 'Sign in';
            events.eClickSignIn(signInButton);

            signInBlock.appendChild(signInButton);

            document.querySelector('header').appendChild(signInBlock);
        }
    }

    function showPhotoPost(post) {
        let photoTable = document.body.getElementsByTagName('section')[0];

        let cell = document.createElement('article');
        events.eLikePost(cell);
        events.eDeletePost(cell);

        cell.setAttribute('id', post.id);

        let authorName = document.createElement('div');
        authorName.className = 'auther-name';
        authorName.innerHTML = post.author;

        let dateAndTime = document.createElement('div');
        dateAndTime.className = 'date-and-time';
        dateAndTime.innerHTML = formatDate(new Date(post.createdAt));

        let image = document.createElement('img');
        image.className = 'image-inside';
        image.setAttribute('src', post.photoLink);

        let imgRedact = document.createElement('img');
        let imgLikes = document.createElement('img');
        let imgDelete = document.createElement('img');
        let countOfLikes = document.createElement('div');
        countOfLikes.className = 'numberOfLikes';
        imgRedact.className = 'redact';
        imgLikes.className = 'like';
        imgDelete.className = 'del';
        let flag = post.likes.indexOf(user);
        if (flag !== -1 || user === null) {
            imgLikes.setAttribute('src', 'img/like.png');
        }
        else {
            imgLikes.setAttribute('src', 'img/likeWB.png');
        }
        if (post.author === user) {
            imgDelete.setAttribute('src', 'img/del.png');

            imgRedact.setAttribute('src', 'img/redact.png');
            events.clickEdit(imgRedact, post);
        }
        countOfLikes.textContent = post.likes.length;
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


        cell.appendChild(authorName);
        cell.appendChild(dateAndTime);
        cell.appendChild(image);

        if (user === post.author) {
            cell.appendChild(imgRedact);
        }

        cell.appendChild(imgLikes);

        if (user === post.author) {
            cell.appendChild(imgDelete);
        }

        cell.appendChild(countOfLikes);

        backUnderPhoto.appendChild(tags);
        backUnderPhoto.appendChild(description);
        cell.appendChild(backUnderPhoto);
        photoTable.appendChild(cell);
    };

    let showPhotoPosts = function (skip, top, filterConfig) {
        document.body.getElementsByTagName('section')[0].textContent = '';
        let array = model.getPhotoPosts(skip, top, filterConfig);
        for (let i = 0; i < array.length; i++) {
            showPhotoPost(array[i]);
        }
        currentCountOfPosts = array.length;
        if (currentCountOfPosts > array.length || array.length < top) {
            document.getElementById('button-more').style.display = 'none';
        }
        else {
            document.getElementById('button-more').style.display = 'block';
        }


        if (array.length === 0) {
            events.eNothingToShow();
        }

    }

    let removePhotoPost = function (id, skip, top, filterConfig) {
        if (model.deletePhotoPost(id)) {
            showPhotoPosts(skip, top, filterConfig);
        }
    }

    let addPhotoPost = function (post, skip, top, filterConfig) {
        if (modul.addPhotoPost(post)) {
            showPhotoPosts(skip, top, filterConfig);
        }
    }

    let editPhotoPost = function (id, post, skip, top, filterConfig) {
        if (modul.editPhotoPost(id.toString(), post)) {
            showPhotoPosts(skip, top, filterConfig);
        }
    }

    function setAuthorInit() {
        let authorSet = new Set();
        let size = model.getPhotoPostArraySize();
        let posts = model.getPhotoPosts(0, size);
        for (let i = 0; i < posts.length; i++) {
            authorSet.add(posts[i].author);
        }

        let options = '';
        for (let item of authorSet) {
            options += '<option value=\"' + item + '\">\n';
        }
        document.getElementById('author-suggestions').innerHTML = options;
    }

    function setHashTagInit() {
        let hashTagsSet = new Set();
        let size = model.getPhotoPostArraySize();
        let posts = model.getPhotoPosts(0, size);
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].hashtags !== undefined) {
                for (let j = 0; j < posts[i].hashtags.length; j++) {
                    hashTagsSet.add(posts[i].hashtags[j]);
                }
            }
        }

        let options = '';
        for (let item of hashTagsSet) {
            options += '<option value=' + item + '>\n';
        }
        document.getElementById('tag-suggestions').innerHTML = options;
    }

    let likePost = function (id) {
        let post = document.getElementById(id);
        let like = post.getElementsByClassName('like')[0];
        let countOfLikes = post.getElementsByClassName('numberOfLikes')[0];
        countOfLikes.textContent = model.getPhotoPost(id).likes.length;
        ;
        like.setAttribute('src', 'img/like.png');
    };

    let unlikePost = function (id) {
        let post = document.getElementById(id);
        let like = post.getElementsByClassName('like')[0];
        let countOfLikes = post.getElementsByClassName('numberOfLikes')[0];
        countOfLikes.textContent = model.getPhotoPost(id).likes.length;
        like.setAttribute('src', 'img/likeWB.png');
    }

    let initPage = function () {
        document.getElementsByTagName('nav')[0].style.display = 'block';
        checkUser();
        setHashTagInit();
        setAuthorInit();
        showPhotoPosts(0, currentCountOfPosts, filterConfig);

    }

    let drowSignInPage = function () {
        document.getElementsByTagName('nav')[0].style.display = 'none';
        document.getElementsByTagName('section')[0].textContent = '';
        document.getElementById('button-more').style.display = 'none';

        let singInCell = document.createElement('div');
        singInCell.className = 'sing-in-cell';

        let portalName = document.createElement('div');
        portalName.id = 'portal-name';
        portalName.textContent = 'mirillis';

        let login = document.createElement('input');
        login.className = 'enter-login-password';
        login.id = 'login';
        login.setAttribute('placeholder', 'Login');
        login.setAttribute('type', 'text');

        let password = document.createElement('input');
        password.className = 'enter-login-password';
        password.id = 'password';
        password.setAttribute('placeholder', 'Password');
        password.setAttribute('type', 'password');

        let button = document.createElement('button');
        button.id = 'sign-in-main';
        button.textContent = 'Sign in';
        button.setAttribute('onclick', 'events.eSignIn(document.getElementById("login").value, document.getElementById("password").value,); return false;');
        singInCell.appendChild(portalName);
        singInCell.appendChild(login);
        singInCell.appendChild(password);
        singInCell.appendChild(button);
        document.body.getElementsByTagName('section')[0].appendChild(singInCell);
    }

    let drawEdit = function (post = null) {
        document.getElementsByTagName('nav')[0].style.display = 'none';
        document.getElementsByTagName('section')[0].textContent = '';
        document.getElementById('button-more').style.display = 'none';

        let newPost = {
            id: null,
            description: null,
            createdAt: null,
            author: null,
            photoLink: null,
            hashtags: null,
            likes: null
        }

        let section = document.getElementsByTagName('section')[0];

        let editPhoto = document.createElement('div');
        editPhoto.className = 'edit-photo';

        let dateOfInsert = document.createElement('div');
        let author = document.createElement('div');
        author.id = 'author-edit';
        dateOfInsert.id = 'date-edit';

        let date;
        if (post) {
            dateOfInsert.textContent = formatDate(new Date(post.createdAt));
            author.textContent = post.author;
        }
        else {
            date = new Date();
            dateOfInsert.textContent = formatDate(date);
            author.textContent = user;
        }
        editPhoto.appendChild(author);
        editPhoto.appendChild(dateOfInsert);


        let iconDown = document.createElement('div');
        iconDown.className = 'icon-download';

        let dropArea = document.createElement('div');
        dropArea.className = 'drag-drop';
        dropArea.innerHTML = '<p>Select the file and drag it to this area.</p>';

        let imgDropArea = document.createElement('img');
        if (post)
            imgDropArea.setAttribute('src', post.photoLink);

        let incorrect_photo = document.createElement('div');
        incorrect_photo.className = 'incorrect-inform';
        events.dragAndDrop(dropArea, incorrect_photo, imgDropArea);

        iconDown.appendChild(dropArea);
        iconDown.appendChild(imgDropArea);
        iconDown.appendChild(incorrect_photo);
        editPhoto.appendChild(iconDown);


        section.appendChild(editPhoto);


        let incorrectInform = document.createElement('div');
        incorrectInform.className = 'incorrect-inform';

        let editDescr = document.createElement('div');
        editDescr.className = 'edit-descr';

        let textAreaDescr = document.createElement('textarea');
        textAreaDescr.className = 'description-edit';
        textAreaDescr.id = 'descr';
        textAreaDescr.setAttribute('placeholder', 'Discription');

        editDescr.appendChild(textAreaDescr);
        section.appendChild(editDescr);

        let editHash = document.createElement('div');
        editHash.className = 'edit-hash';
        let textAreaHash = document.createElement('textarea');
        textAreaHash.className = 'description-edit';
        textAreaHash.id = 'hash';
        textAreaHash.setAttribute('placeholder', 'Hashtags');
        let hashSring = '';
        if (post) {
            textAreaDescr.textContent = post.description;
            textAreaHash.textContent = post.hashtags.join(' ');
        }

        editHash.appendChild(textAreaHash);
        section.appendChild(editHash)


        let buttonDone = document.createElement('div');
        buttonDone.className = 'button-done';
        buttonDone.innerHTML = 'Done';

        section.appendChild(incorrectInform);
        section.appendChild(buttonDone);

        events.clickDoneButton(post, newPost, imgDropArea, incorrectInform, date, buttonDone, textAreaHash, textAreaDescr);
    };

    function formatDate(date) {

        let dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        let mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        let yy = date.getFullYear() % 100;
        if (yy < 10) yy = '0' + yy;

        return dd + '.' + mm + '.' + yy;
    }

    return {
        showPhotoPosts,
        removePhotoPost,
        addPhotoPost,
        editPhotoPost,
        checkUser,
        setAuthorInit,
        setHashTagInit,
        likePost,
        unlikePost,
        initPage,
        drowSignInPage,
        drawEdit
    }
}());
//readFromStorage();
dom.initPage();

/*function display(skip, top, filterConfig) {
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
}*/
//dom.checkUser();

//тетсты
//display(0, 20)
//display(0, 20, { hashtags: ['#friends']})
//editPost('1', {description: 'Hello', hashtags: ['#summer']})
//removePost(1,0,20)
//addPost(CorrectPost,0,20)
//addAuthorSuggestions()
//addTagsSuggestions()