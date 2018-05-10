let http = require('http');
let fs = require('fs');

http.createServer(function (request, response) {

    console.log(`Запрошенный адрес: ${request.url}`);
    if (request.url.startsWith('/public/')) {
        let filePath = request.url.substr(1);
        fs.readFile(filePath, function (error, data) {

            if (error) {
                response.statusCode = 404;
                response.end('No resources found!!!');
            }
            else {
                response.end(data);
            }
            return;
        })
    }
    else {
        response.end('Error!');
    }
}).listen(5000);