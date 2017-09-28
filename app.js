const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

var stream;

io.on('connection', function (socket) {

    console.log('new connection made');


    socket.emit('signal', {});
    socket.on('video-from-client', function (evt) {
        console.log('video-from-client', evt);
        if (stream) {
            socket.emit('send-video-backend', stream);
        } else {
            stream = evt;
            socket.emit('send-video-backend', stream);
        }
    });

});

server.listen(port, function () {
    console.log("Server listen on port " + port);
});