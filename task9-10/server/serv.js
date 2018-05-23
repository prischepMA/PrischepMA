const express = require('express');
const fs = require("fs");
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/img');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
})
let upload = multer({storage: storage});

async function getPhotoPost(id) {
    jsonPosts = await fs.readFileSync('./data/posts.json');
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

async function getAllPhotoPosts() {
    return await fs.readFileSync('./data/posts.json');
}

async function getPhotoPosts(skip, top, filterConfig) {

    let posts =  JSON.parse( await fs.readFileSync('./data/posts.json'));
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

async function validatePhotoPost(photoPost, flag) {

    let posts = JSON.parse(await fs.readFileSync('./data/posts.json'));


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

async function addPhotoPost(photoPost) {
    let posts = JSON.parse(await fs.readFileSync('./data/posts.json'));

    if (validatePhotoPost(photoPost)) {
        posts.push(photoPost);
        posts.sort(compareByDate);
        await fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
};

async function getPhotoPostArraySize() {
    let posts = JSON.parse(await fs.readFileSync('./data/posts.json'));
    return posts.length;
}

async function editPhotoPost(id, photoPost) {

    let clone = {};
    let posts = JSON.parse(await fs.readFileSync('./data/posts.json'));


    let tmp = posts[posts.findIndex(item => item.id === id)];

    for (let key in tmp) {
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
    await fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
    return true;
};

async function removePhotoPost(id) {
    let posts = JSON.parse(await fs.readFileSync('./data/posts.json'));
    let index = posts.findIndex(item => item.id === id);
    if (index !== -1) {
        posts.splice(index, 1);
        await fs.writeFileSync('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
}

async function saveChanges(postTmp) {
    let jsonPosts = await fs.readFileSync('./data/posts.json');
    let posts = JSON.parse(jsonPosts, function (key, value) {
        if (key === 'createdAt') {
            return new Date(value);
        }
        return value;
    });
    let post = posts.find((post) => postTmp.id === post.id);
    posts[posts.indexOf(post)] = postTmp;
    await fs.writeFileSync('./data/posts.json', JSON.stringify(posts));

}

async function likePost(id, user) {
    let post = JSON.parse(await getPhotoPost(id));
    if (post) {
        let idxUser = post.likes.indexOf(user);
        if (idxUser === -1) {
            post.likes.push(user);
            await saveChanges(post);
            return true
        }
        post.likes.splice(idxUser, 1);
        await saveChanges(post);
    }
    return false;
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('../public'));

app.get('/getPhotoPost/:id',async function (req, res) {
    let post = await getPhotoPost(req.params.id);
    if (post !== undefined) {
        res.send(200, post);
    }
    else {
        res.send(404, `Photopost ${req.params.id} not found!!!`);
    }
});

app.get('/likePost',async function (req, res) {
    let flag = await likePost(req.query.id, req.query.user);
    res.send(200, flag);
    longPol.publish(await getAllPhotoPosts());
});

app.put('/editPhotoPost/:id',async function (req, res) {
    if (await editPhotoPost(req.params.id, req.body)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, `Photopost with id = ${req.params.id} was edited`);
    }
    else {
        res.send(404, 'Error!!!');
    }
})

app.get('/getPhotoPostArraySize',async function (req, res) {
    let size = await getPhotoPostArraySize();
    if (size !== undefined) {
        res.send(200, size);
    }
    else {
        res.send(404, `Error!!!`);
    }
});

app.post('/getPhotoPosts',async function (req, res) {
    let skip = parseInt(req.query.skip);
    let top = parseInt(req.query.top);
    let filterConfig = req.body;

    let answer = await getPhotoPosts(skip, top, filterConfig);
    if (answer !== undefined) {
        res.send(200, answer);
    }
    else {
        res.send(404, 'Error!!!');
    }
});


app.post('/addPhotoPost',async function (req, res) {
    if (await addPhotoPost(req.body)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, `Photopost was added`);
    }
    else {
        res.send(404, `Error!!!`);
    }
});

app.delete('/removePhotoPost/:id',async function (req, res) {
    if (await removePhotoPost(req.params.id)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, `Post with id = ${req.params.id} was successfully deleted`);
    }
    else {
        res.send(404, `Post with id = ${req.params.id} was not found`);
    }
})

app.post('/downloadFile', upload.single('file'), function (req, res) {
    let filename = req.file.filename;

    if (filename !== null) {
        res.send(200, JSON.stringify('./img/' + filename));
    }
    else {
        res.send(400, 'Photo downloading failed');
    }
})

let longPol = require('./longPol');

app.get('/subscribe', function(req, res,)  {
    longPol.subscribe(req, res);
});

app.listen(5000, function () {
    console.log('Server is running...');
});