const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    console.log('new connection made');
});

server.listen(port, function () {
    console.log("Server listen on port " + port);
});