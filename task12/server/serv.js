const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');

const passport = require('passport');
const session = require('express-session');
const JsonStrategy = require('passport-json').Strategy;
const cookieParser = require('cookie-parser');

const verification = require('./verification');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('../public'));

// Middlewares, которые должны быть определены до passport:
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));

// Passport:
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new JsonStrategy(async (username, password, done) => {
    try {
        const user = await verification.verifyPassword(username, password);
        if (user) {
            console.log('true');
            return done(null, user);
        }
        return done(null, false);
    } catch (err) {
        return done(err);
    }
}));

app.post('/login', passport.authenticate('json', { failureRedirect: '/loginfail' }), (req, res) => {
    res.redirect('/');
});

app.get('/loginfail', (req, res) => {
    res.json(200, false);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.json(200, true);
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/img');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    },
});

let upload = multer({ storage: storage });

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', (err, d) => {
            if (err) {
                reject(err);
            } else {
                resolve(d);
            }
        });
    });
}

async function getPhotoPost(id) {
    let jsonPosts = await readFile('./data/posts.json');
    let posts = JSON.parse(jsonPosts, function (key, value) {
        if (key === 'createdAt') {
            return new Date(value);
        }
        return value;
    });
    return JSON.stringify(posts.find(post => id === post.id));
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
    let fileTmp = await readFile('./data/posts.json');
    return fileTmp;
}

async function getPhotoPosts(skipP, topP, filterConfig) {
    let skip = skipP;
    let top = topP;
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);
    posts.sort(compareByDate);

    if (typeof (skip) !== 'number') {
        skip = 0;
    }

    if (typeof (top) !== 'number') {
        top = 10;
    }
    if (filterConfig) {
        if (filterConfig.author && (typeof (filterConfig.author) !== 'string' || filterConfig.author.length === 0) ||
            filterConfig.createdAt && filterConfig.Date === 'Invalid Date' ||
            filterConfig.hashtags && !validTypeOfArray(filterConfig.hashtags)
            && !validHashtags(filterConfig.hashtags)) {
            return [];
        }
        if (filterConfig.author) {
            posts = posts.filter(function (item) {
                return item.author === filterConfig.author;
            });
        }

        if (filterConfig.createdAt && filterConfig.createdAt !== 'Invalid Date') {
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
                });
            });
        }
    }
    posts = posts.slice(skip, skip + top);
    return posts;
}

async function validatePhotoPost(photoPost, flag) {
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);


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

    if (typeof (photoPost.createdAt) === 'undefined' || photoPost.createdAt === 'Invalid Date') {
        return false;
    }

    if (typeof (photoPost.author) !== 'string' || photoPost.author.length === 0) {
        return false;
    }

    if (!validTypeOfArray(photoPost.likes)) {
        return false;
    }
    return true;
}

async function addPhotoPost(photoPost) {
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);

    if (validatePhotoPost(photoPost)) {
        posts.push(photoPost);
        posts.sort(compareByDate);
        await writeFile('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
}

async function getPhotoPostArraySize() {
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);
    return posts.length;
}

async function editPhotoPost(id, photoPost) {
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);
    let tmp = posts[posts.findIndex(item => item.id === id)];

    if (typeof (tmp) === 'undefined') {
        return false;
    }

    if (photoPost.description) {
        tmp.description = photoPost.description;
    }
    if (photoPost.photoLink) {
        tmp.photoLink = photoPost.photoLink;
    }
    if (photoPost.hashtags) {
        tmp.hashtags = photoPost.hashtags;
    }

    let flag = 'change';

    if (!validatePhotoPost(tmp, flag)) {
        return false;
    }

    posts[posts.findIndex(item => item.id === id)] = tmp;
    await writeFile('./data/posts.json', JSON.stringify(posts));
    return true;
}

async function removePhotoPost(id) {
    let jsonString = await readFile('./data/posts.json')
    let posts = JSON.parse(jsonString);
    let index = posts.findIndex(item => item.id === id);
    if (index !== -1) {
        posts.splice(index, 1);
        await writeFile('./data/posts.json', JSON.stringify(posts));
        return true;
    }
    return false;
}

async function saveChanges(postTmp) {
    let jsonPosts = await readFile('./data/posts.json');
    let posts = JSON.parse(jsonPosts, function (key, value) {
        if (key === 'createdAt') {
            return new Date(value);
        }
        return value;
    });
    let post = posts.find(postF => postTmp.id === postF.id);
    posts[posts.indexOf(post)] = postTmp;
    await writeFile('./data/posts.json', JSON.stringify(posts));
}

async function likePost(id, user) {
    let post = JSON.parse(await getPhotoPost(id));
    if (post) {
        let idxUser = post.likes.indexOf(user);
        if (idxUser === -1) {
            post.likes.push(user);
            await saveChanges(post);
            return true;
        }
        post.likes.splice(idxUser, 1);
        await saveChanges(post);
    }
    return false;
}

let longPol = require('./longPol');


app.get('/getPhotoPost/:id', async function (req, res) {
    let post = await getPhotoPost(req.params.id);
    if (post !== undefined) {
        res.send(200, post);
    } else {
        res.send(404, `Photopost ${req.params.id} not found!!!`);
    }
});

app.get('/likePost', async function (req, res) {
    let flag = await likePost(req.query.id, req.query.user);
    res.send(200, flag);
    longPol.publish(await getAllPhotoPosts());
});

app.put('/editPhotoPost/:id', async function (req, res) {
    if (await editPhotoPost(req.params.id, req.body)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, `Photopost with id = ${req.params.id} was edited`);
    } else {
        res.send(404, 'Error!!!');
    }
});

app.get('/getPhotoPostArraySize', async function (req, res) {
    let size = await getPhotoPostArraySize();
    if (size !== undefined) {
        res.send(200, size);
    } else {
        res.send(404, 'Error!!!');
    }
});

app.post('/getPhotoPosts', async function (req, res) {
    let skip = parseInt(req.query.skip, 10);
    let top = parseInt(req.query.top, 10);
    let filterConfig = req.body;

    let answer = await getPhotoPosts(skip, top, filterConfig);
    if (answer !== undefined) {
        res.send(200, answer);
    } else {
        res.send(404, 'Error!!!');
    }
});

app.post('/addPhotoPost', async function (req, res) {
    if (await addPhotoPost(req.body)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, 'Photopost was added');
    } else {
        res.send(404, 'Error!!!');
    }
});

app.delete('/removePhotoPost/:id', async function (req, res) {
    if (await removePhotoPost(req.params.id)) {
        longPol.publish(await getAllPhotoPosts());
        res.send(200, `Post with id = ${req.params.id} was successfully deleted`);
    } else {
        res.send(404, `Post with id = ${req.params.id} was not found`);
    }
});

app.post('/downloadFile', upload.single('file'), function (req, res) {
    let filename = req.file.filename;

    if (filename !== null) {
        res.send(200, JSON.stringify(String('./img/') + filename));
    } else {
        res.send(400, 'Photo downloading failed');
    }
});


app.get('/subscribe', function (req, res) {
    longPol.subscribe(req, res);
});

/** const acc = [
    ['Прищеп Максим', 'максим'],
    ['Валай Александр', 'александр'],
    ['Никифоров Никита', 'никита'],
    ['Гаврушко Дмитрий', 'дмитрий'],
];*/

app.listen(3000, function () {
    console.log('Server is running...');
   /**  let array = new Map();

    let tmp = 0

    for (tmp; tmp < acc.length; tmp++)
    {
        array.set(acc[tmp] [0],verification.saltHashPassword(acc[tmp] [1]));
    }

    let answer = array.get('heloo');

    writeFile('./data/passwords.json', JSON.stringify([...array]));*/
});
