let model = (function () {
    function deletePhotoPost(id) {
        return new Promise((resolve, reject) => {
            if (id === undefined) {
                reject(new Error('something bad happened'));
            }

            let xhr = new XMLHttpRequest();

            xhr.open('DELETE', `removePhotoPost/${id}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    //console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                    reject(new Error('something bad happened'));
                } else {
                    resolve(true);
                }
            };

            xhr.send();
        });
    }

    function getPhotoPosts(skipP, topP, filterConfig) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            let skip = skipP;
            let top = topP;
            if (skip === undefined) {
                skip = 0;
            }

            if (top === undefined) {
                top = 10;
            }
            xhr.open('POST', `getPhotoPosts?skip=${skip}&top=${top}`, true);

            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                } else {
                    resolve(JSON.parse(xhr.responseText, function (key, value) {
                        if (key === 'createdAt') {
                            return new Date(value);
                        }
                        return value;
                    }));
                }
            };

            if (filterConfig !== undefined) {
                xhr.send(JSON.stringify(filterConfig));
            } else {
                xhr.send();
            }
        });
    }

    function getPhotoPostArraySize() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.open('get', 'getPhotoPostArraySize', true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                    reject(new Error('something bad happened'));
                } else {
                    resolve(xhr.responseText);
                }
            };

            xhr.send();
        });
    }

    function getPhotoPost(id) {
        return new Promise((resolve) => {
            if (id === undefined) {
                return;
            }

            let xhr = new XMLHttpRequest();

            xhr.open('GET', `getPhotoPost/${id}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                } else {
                    resolve(JSON.parse(xhr.responseText, function (key, value) {
                        if (key === 'createdAt') {
                            return new Date(value);
                        }
                        return value;
                    }));
                }
            };

            xhr.send();
        });
    }

    function likePost(id) {
        return new Promise((resolve) => {
            if (id === undefined) {
                return;
            }

            let xhr = new XMLHttpRequest();

            xhr.open('GET', `/likePost/?id=${id}&user=${user}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                } else {
                    resolve(xhr.responseText);
                }
            };

            xhr.send();
        });
    }

    function addPhotoPost(photoPost) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            if (photoPost === undefined) {
                reject(new Error('something bad happened'));
            }

            xhr.open('POST', 'addPhotoPost', true);

            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                    reject(new Error('something bad happened'));
                } else {
                    resolve(true);
                }
            };

            xhr.send(JSON.stringify(photoPost));
        });
    }

    function downloadFile(file) {
        return new Promise((resolve, reject) => {
            if (file === null || file === undefined) {
                reject(new Error('something bad happened'));
            }

            let xhr = new XMLHttpRequest();

            xhr.open('POST', 'downloadFile', true);

            let formData = new FormData();
            formData.append('file', file);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                } else {
                    resolve(JSON.parse(xhr.responseText));
                }
            };

            xhr.send(formData);
        });
    }

    function editPhotoPost(id, photoPost) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            if (id === undefined) {
                reject(new Error('something bad happened'));
            }

            if (photoPost === undefined) {
                reject(new Error('something bad happened'));
            }

            xhr.open('PUT', `editPhotoPost/${id}`, true);

            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    //console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                    reject(new Error('something bad happened'));
                } else {
                    resolve(true);
                }
            };

            xhr.send(JSON.stringify(photoPost));
        });
    }

    function longPollingControl() {
        return new Promise(() => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', 'subscribe', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                } else {
                    dom.showPhotoPosts(0, currentCountOfPosts, filterConfig);
                }
                longPollingControl();
            };
            xhr.send();
        });
    }
    function logIn(login, password) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'login', true);
            xhr.setRequestHeader('Content-type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;

                if (xhr.status !== 200) {
                    console.log(`${xhr.status}:${xhr.responseText || xhr.statusText}`);
                    reject(new Error('Invalid query'));
                }
                resolve(xhr.responseText);
            };

            xhr.send(JSON.stringify({username: login, password: password }));
        });
    }

    function logOut() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'logout', true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;

                if (xhr.status !== 200) {
                    reject(new Error('Invalid query'));
                }
                resolve(xhr.responseText);
            };

            xhr.send();
        });
    };

    longPollingControl();

    function tmp() {
        return 0;
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
        tmp,
        logIn,
        logOut,
    };
}());
model.tmp();

