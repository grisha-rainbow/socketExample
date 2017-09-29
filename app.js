const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

io.on('connection', function (socket) {

    console.log('new connection made');


    socket.on('signal', function (evt) {
        console.log("Signal event!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", evt)
    });


    socket.on('send-message', function (evt) {
        console.log('video-from-client', evt);
        socket.broadcast.emit('get-message', evt);
    });

    socket.on('disconnect', function() {
        console.log("Client disconnect");
    });
});

server.listen(port, function () {
    console.log("Server listen on port " + port);
});