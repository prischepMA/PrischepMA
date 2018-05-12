const express = require('express');
const fs = require("fs");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('../public'));

function getPhotoPost(id) {
    let jsonPosts = fs.readFileSync('./data/posts.json');
    let posts = JSON.parse(jsonPosts, function (key, value) {
        if (key === 'createdAt') {
            return new Date(value);
        }
        return value;
    });
    return JSON.stringify(posts.find((post) => id === post.id));
}

function compareByDate(photoPostA, photoPostB) {
    return new Date(photoPostB.createdAt) - new Date(photoPostA.createdAt);
}

function validTypeOfArray(array) {
    if (Array.isArray(array)) {
        return array.every(function (item) {
            return typeof (item) === 'string';
        });
    }
    return false;
}

function checkSpace(array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i].charAt(j) === ' ') {
                return false;
            }
        }
    }

    return true;
}

function validHashtags(array) {
    if (Array.isArray(array)) {
        return array.every(function (item) {
            return item.charAt(0) === '#' && checkSpace(array);
        });
    }

    return false;
}

function getPhotoPosts(skip, top, filterConfig) {

    let posts = JSON.parse(fs.readFileSync('./data/posts.json'));
    posts.sort(compareByDate);

    if (typeof (skip) !== 'number') {
        skip = 0;
    }

    if (typeof (top) !== 'number') {
        top = 10;
    }
    if (filterConfig) {
        if (filterConfig.author && (typeof (filterConfig.author) !== 'string' || filterConfig.author.length === 0) ||
            filterConfig.createdAt && filterConfig.Date == 'Invalid Date' ||
            filterConfig.hashtags && !validTypeOfArray(filterConfig.hashtags) && !validHashtags(filterConfig.hashtags)) {
            return [];
        }
        if (filterConfig.author) {
            posts = posts.filter(function (item) {
                return item.author === filterConfig.author;
            });
        }

        if (filterConfig.createdAt && filterConfig.createdAt != 'Invalid Date') {
            posts = posts.filter(function (item) {
                return Date.parse(item.createdAt) > Date.parse(filterConfig.createdAt);
            });
        }

        if (filterConfig.hashtags && filterConfig.hashtags[0] !== '') {
            posts = posts.filter(function (postItem) {
                if (typeof (postItem.hashtags) === 'undefined') {
                    return false;
                }
                return filterConfig.hashtags.every(function (item) {
                    return postItem.hashtags.includes(item);
                })
            })
        }
    }
    posts = posts.slice(skip, skip + top);
    return posts;
};

function validatePhotoPost(photoPost, flag) {

    let posts = JSON.parse(fs.readFileSync('./data/posts.json'));


    if (!photoPost) {
        return false;
    }

    if (typeof (photoPost.description) === 'undefined' || typeof (photoPost.description) !== 'string' || photoPost.description.length > 200) {
        return false;
    }

    if (typeof (photoPost.photoLink) === 'undefined' || typeof (photoPost.photoLink) !== 'string' || photoPost.photoLink.length === 0) {
        return false;
    }

    if (!(typeof (photoPost.hashtags) === 'undefined' || validTypeOfArray(photoPost.hashtags))) {
        return false;
    }

    if (typeof (photoPost.hashtags) !== 'undefined' && !validHashtags(photoPost.hashtags)) {
        return false;
    }

    if (!flag) {
        if (typeof (photoPost.id) === 'undefined' || posts.findIndex(item => item.id === photoPost.id) !== -1 || typeof (photoPost.id) !== 'string') {
            return false;
        }
    }

    if (typeof (photoPost.createdAt) === 'undefined' || photoPost.createdAt == 'Invalid Date') {
        return false;
    }

    if (typeof (photoPost.author) !== 'string' || photoPost.author.length === 0) {
        return false;
    }

    if (!validTypeOfArray(photoPost.likes)) {
        return false;
    }
    return true;
};

function addPhotoPost(photoPost) {
    let posts = JSON.parse(fs.readFileSync('./data/posts.json'));

    if (validatePhotoPost(photoPost)) {
        posts.push(photoPost);
        posts.sort(compareByDate);
        fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
};

function editPhotoPost(id, photoPost) {

    var clone = {};
    let posts = JSON.parse(fs.readFileSync('./data/posts.json'));


    var tmp = posts[posts.findIndex(item => item.id === id)];

    for (var key in tmp) {
        clone[key] = tmp[key];
    }

    if (typeof (clone) === 'undefined') {
        return false;
    }

    if (photoPost.description) {
        clone.description = photoPost.description;
    }
    if (photoPost.photoLink) {
        clone.photoLink = photoPost.photoLink;
    }
    if (photoPost.hashtags) {
        clone.hashtags = photoPost.hashtags;
    }

    let flag = 'change';

    if (!validatePhotoPost(clone, flag)) {
        return false;
    }

    posts[posts.findIndex(item => item.id === id)] = clone;
    fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
    return true;
};

function removePhotoPost(id) {
    let posts = JSON.parse(fs.readFileSync('./data/posts.json'));
    let index = posts.findIndex(item => item.id === id);
    if (index !== -1) {
        posts.splice(index, 1);
        fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
}

app.get('/getPhotoPost/:id', function (req, res) {
    let post = getPhotoPost(req.params.id);
    if (post !== undefined) {
        res.send(200, post);
    }
    else {
        res.send(404, `Photopost ${req.params.id} not found!!!`);
    }
});

app.post('/getPhotoPosts', function (req, res) {
    let skip = parseInt(req.query.skip);
    let top = parseInt(req.query.top);
    let filterConfig = req.body;

    let answer = getPhotoPosts(skip, top, filterConfig);
    if (answer !== undefined) {
        res.send(200, answer);
    }
    else {
        res.send(404, 'Error!!!');
    }
})


app.post('/addPhotoPost', function (req, res) {
    if (addPhotoPost(req.body)) {
        res.send(200, `Photopost was added`);
    }
    else {
        res.send(404, `Error!!!`);
    }
})

app.put('/editPhotoPost/:id', function (req, res) {
    if (editPhotoPost(req.params.id, req.body)) {
        res.send(200, `Photopost with id = ${req.params.id} was edited`);
    }
    else {
        res.send(404, 'Error!!!');
    }
})

app.delete('/removePhotoPost/:id', function (req, res) {
    if (removePhotoPost(req.params.id)) {
        res.send(200, `Post with id = ${req.params.id} was successfully deleted`);
    }
    else {
        res.send(404, `Post with id = ${req.params.id} was not found`);
    }
})

app.listen(3000, function () {
    console.log('Server is running...');
});