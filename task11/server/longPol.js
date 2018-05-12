let clients = [];

exports.subscribe = function (req, res) {
    clients.push(res);
    res.on('close', function () {
        clients.splice(clients.indexOf(res), 1);
    });
};

exports.publish = function (message) {
    clients.forEach(function (res) {
        res.send(message);
    });
    console.log(String('send') + clients.length);
    clients = [];
};

setInterval(function () {
    console.log(clients.length);
}, 2000);
