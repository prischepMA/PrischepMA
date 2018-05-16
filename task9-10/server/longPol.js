let clients = [];

exports.subscribe = function (req, res) {
    clients.push(res);
    //console.log('subscribe');
    res.on('close', function () {
        clients.splice(clients.indexOf(res), 1);
    })
};

exports.publish = function (message) {
    clients.forEach(function (res) {
        res.send(message);
    })
    console.log('send' + clients.length);
    clients = [];
}

setInterval(function () {
    console.log(clients.length);
}, 2000);