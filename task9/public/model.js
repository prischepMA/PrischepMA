let model = function () {

    function deletePhotoPost(id) {
        if (id === undefined) {
            return false;
        }

        let xhr = new XMLHttpRequest();

        xhr.open('DELETE', `removePhotoPost/${id}`, false);

        let result = false;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = false;
            }
            else {
                result = true;
            }
        }

        xhr.send();

        return result;
    }

    function getPhotoPosts(skip, top, filterConfig) {
        let xhr = new XMLHttpRequest();

        if (skip === undefined) {
            skip = 0;
        }

        if (top === undefined) {
            top = 10;
        }

        xhr.open('POST', `getPhotoPosts?skip=${skip}&top=${top}`, false);

        xhr.setRequestHeader('Content-Type', 'application/json');

        let photoPosts;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
            }
            else {
                photoPosts = JSON.parse(xhr.responseText, function (key, value) {
                    if (key == 'createdAt')
                        return new Date(value);
                    return value;
                });
            }
        }

        if (filterConfig !== undefined) {
            xhr.send(JSON.stringify(filterConfig));
        }
        else {
            xhr.send();
        }

        return photoPosts;
    }

    function getPhotoPostArraySize() {
        let xhr = new XMLHttpRequest();

        xhr.open('get', `getPhotoPostArraySize`, false);

        let result = 0;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = 0;
            }
            else {
                result = xhr.responseText;
            }
        }

        xhr.send();

        return result;
    }

    function getPhotoPost(id) {
        if (id === undefined) {
            return;
        }

        let xhr = new XMLHttpRequest();

        xhr.open('GET', `getPhotoPost/${id}`, false);

        let photoPost;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
            }
            else {
                photoPost = JSON.parse(xhr.responseText, function (key, value) {
                    if (key == 'createdAt')
                        return new Date(value);
                    return value;
                });
            }
        }

        xhr.send();

        return photoPost;
    }

    function likePost(id) {
        if (id === undefined) {
            return;
        }

        let xhr = new XMLHttpRequest();

        xhr.open('GET', `likePost/${id}`, false);

        let flag;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
            }
            else {
                flag = xhr.responseText;
            }
        }

        xhr.send();

        return flag;
    }

    function getUserName() {
        let xhr = new XMLHttpRequest();

        xhr.open('get', `getUserName`, false);

        let result = '';

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = '';
            }
            else {
                result = xhr.responseText;
            }
        }

        xhr.send();

        return result;
    }

    function addPhotoPost(photoPost) {
        let xhr = new XMLHttpRequest();

        if (photoPost === undefined) {
            return false;
        }

        xhr.open('POST', `addPhotoPost`, false);

        xhr.setRequestHeader('Content-Type', 'application/json');

        let result = false;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = false;
            }
            else {
                result = true;
            }
        }

        xhr.send(JSON.stringify(photoPost));

        return result;
    }

    function downloadFile(file) {
        if (file === null || file === undefined) {
            return null;
        }

        var xhr = new XMLHttpRequest();

        xhr.open('POST', `downloadFile`, false);

        var formData = new FormData();
        formData.append('file', file);

        var fileName = null;
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
            }
            else {
                fileName = JSON.parse(xhr.responseText);
            }
        }

        xhr.send(formData);

        return fileName;
    }

    function editPhotoPost(id, photoPost) {
        let xhr = new XMLHttpRequest();

        if (id === undefined) {
            return false;
        }

        if (photoPost === undefined) {
            return false;
        }

        xhr.open('PUT', `editPhotoPost/${id}`, false);

        xhr.setRequestHeader('Content-Type', 'application/json');

        let result = false;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = false;
            }
            else {
                result = true;
            }
        }

        xhr.send(JSON.stringify(photoPost));

        return result;
    }

    function setUser(userName) {
        let xhr = new XMLHttpRequest();

        if (user === undefined) {
            return false;
        }

        xhr.open('GET', `setUser/${userName}`, false);

        let result = false;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                result = false;
            }
            else {
                result = true;
            }
        }

        xhr.send();

        return result;
    }

    function longPollingControl() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `subscribe`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                let photoPosts = JSON.parse(this.responseText);
                dom.showPhotoPosts(0, currentCountOfPosts, filterConfig);
            }
            longPollingControl();
        }
        xhr.send();
    }

    return {
        deletePhotoPost,
        getPhotoPosts,
        getPhotoPostArraySize,
        getPhotoPost,
        likePost,
        getUserName,
        addPhotoPost,
        downloadFile,
        editPhotoPost,
        setUser,
        longPollingControl,
    }
}();

model.longPollingControl();