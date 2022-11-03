'use strict';
const http = require('http');
var fs = require('fs'), path = require('path');
const port = 20063;
let rootPath = null;
let photoPath = null;

fs.readFile("./setings.json", function (err, data) {
    let parsedData = JSON.parse(data);
    rootPath = (parsedData.rootPath);
    photoPath = (parsedData.photoPath);
});


const server = http.createServer(async (request, response) => {
    let filePath = path.join(rootPath, request.url);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

    if (request.method == 'POST') {
        var jsonString = '';
        request.on('data', function (data) {
            jsonString += data;
        });
        request.on('end', async function () {
            if (request.url.startsWith('/askingForPhotoCategory')) {
                let neededCategories = JSON.parse(jsonString).listofNeededCategories;
                let imageNames = [];
                for (let category of neededCategories) {
                    filePath = path.join(photoPath, category);
                    let tempNameList = await collectImageNames(filePath);
                    for (let tempName of tempNameList) {
                        imageNames.push({
                            category: category,
                            name: tempName
                        });
                    }
                }
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(imageNames), 'utf-8');
            }
        });
        return;
    }

    if (request.url.startsWith('/ppp/photos')) {
        filePath = path.join(photoPath, request.url.substring("/ppp/photos".length, request.url.length));
        filePath = decodeURI(filePath);
        sendFile(filePath, response);
        return;
    }


    if (request.url == '/' || request.url == '') {
        filePath = path.join(rootPath, 'start.html');
        sendFile(filePath, response);
        return;
    }

    filePath = path.join(rootPath, request.url);
    sendFile(filePath, response);
});
server.listen(port);

function collectImageNames(imagePath) {
    return new Promise((resolve, reject) => {
        fs.readdir(imagePath, (err, files) => {
            resolve(files);
        })
    });
}




function sendFile(filePath, response) {
    if (fs.existsSync(filePath)) {
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.mp3':
                contentType = 'audio/mp3';
                break;
        }

        fs.readFile(filePath, function (err, data) {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(data, 'utf-8');
        });
    } else {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('File not found', 'utf-8');
    }
    return;
}