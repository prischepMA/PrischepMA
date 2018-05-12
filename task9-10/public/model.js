let model = function () {

    function deletePhotoPost(id) {
        return new Promise((resolve, reject) => {
            if (id === undefined) {
                reject(false);
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
                    reject(false);
                }
                else {
                    resolve(true);
                }
            }

            xhr.send();
        });
    }

    function getPhotoPosts(skip, top, filterConfig) {
        return new Promise((resolve, reject) => {
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
                    resolve(JSON.parse(xhr.responseText, function (key, value) {
                        if (key == 'createdAt')
                            return new Date(value);
                        return value;
                    }));
                }
            }

            if (filterConfig !== undefined) {
                xhr.send(JSON.stringify(filterConfig));
            }
            else {
                xhr.send();
            }
        });
    }

    function getPhotoPostArraySize() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.open('get', `getPhotoPostArraySize`, false);

            let result = 0;

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                    reject(0);
                }
                else {
                    resolve(xhr.responseText);
                }
            }

            xhr.send();
        });
    }

    function getPhotoPost(id) {
        return new Promise((resolve, reject) => {
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
                    resolve(JSON.parse(xhr.responseText, function (key, value) {
                        if (key == 'createdAt')
                            return new Date(value);
                        return value;
                    }));
                }
            }

            xhr.send();
        });
    }

    function likePost(id) {
        return new Promise((resolve, reject) => {
            if (id === undefined) {
                return;
            }

            let xhr = new XMLHttpRequest();

            xhr.open('GET', `/likePost/?id=${id}&user=${user}`, false);

            let flag;

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                }
                else {
                    resolve(xhr.responseText);
                }
            }

            xhr.send();
        });
    }

    function addPhotoPost(photoPost) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            if (photoPost === undefined) {
                reject(false);
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
                    reject(false);
                }
                else {
                    resolve(true);
                }
            }

            xhr.send(JSON.stringify(photoPost));
        });
    }

    function downloadFile(file) {
        return new Promise((resolve, reject) => {
            if (file === null || file === undefined) {
                reject(null);
            }

            let xhr = new XMLHttpRequest();

            xhr.open('POST', `downloadFile`, false);

            let formData = new FormData();
            formData.append('file', file);

            let fileName = null;
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                }
                else {
                    resolve(JSON.parse(xhr.responseText));
                }
            }

            xhr.send(formData);
        });
    }

    function editPhotoPost(id, photoPost) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            if (id === undefined) {
                reject(false);
            }

            if (photoPost === undefined) {
                reject(false);
            }

            xhr.open('PUT', `editPhotoPost/${id}`, true);

            xhr.setRequestHeader('Content-Type', 'application/json');

            let result = false;

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                    reject(false);
                }
                else {
                    resolve(true);
                }
            }

            xhr.send(JSON.stringify(photoPost));
        });
    }

    longPollingControl();

    function longPollingControl() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', `subscribe`, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(xhr.status + ': ' + xhr.responseText || xhr.statusText);
                } else {
                    let photoPosts = JSON.parse(this.responseText);
                    dom.showPhotoPosts(0, currentCountOfPosts, filterConfig);
                }
                longPollingControl();
            }
            xhr.send();
        });
    }

    return {
        deletePhotoPost,
        getPhotoPosts,
        getPhotoPostArraySize,
        getPhotoPost,
        likePost,
        addPhotoPost,
        downloadFile,
        editPhotoPost,
        longPollingControl,
    }
}();