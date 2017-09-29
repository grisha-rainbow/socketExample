var socket = io('http://localhost:3000');

var makeConnection = function () {
    event.preventDefault();

    var inputValue = document.getElementById('incoming').value;

    if (inputValue) {
        socket.emit('send-message', {message: inputValue})
    }
};

socket.on('get-message', function (evt) {
    console.log("Get messasge");
    var messagesContainer = document.getElementById('messages');
    console.log(evt);
    var paragraph = document.createElement('p');
    var t = document.createTextNode(evt.message);
    console.dir(paragraph);
    console.log(paragraph, evt);
    paragraph.appendChild(t);
    messagesContainer.appendChild(paragraph);
});

socket.on('disconnect', function() {
    console.log("Client disconect");
});


// var pc;
// var configuration = null;
// start();
//
//
//
// var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
// var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
// var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
//
// function start(isCaller) {
//     pc = new RTCPeerConnection(null);
//
//     console.log(pc);
//
//     pc.onicecandidate = function (evt) {
//         console.log('candidate');
//     };
//
//     pc.onaddsstream = function (evt) {
//         console.log('onaddsstream');
//     };

    // navigator.getUserMedia({"audio": true, "video": true}, function (stream) {
    //     URL.createObjectUrl(stream);
    // })
// }


// document.getElementsByTagName('form')[0].addEventListener('onsubmit', makeConnection, false);

// var makeConnection = function () {
//     event.preventDefault();
//     console.log("Connection");
//
//     var inputValue = document.getElementById('incoming').value;
//     console.log(inputValue);
//
//
//
//     var peer = new Peer({key: 'bm4r4i7opmvlsor'});
// // You can pick your own id or omit the id if you want to get a random one from the server.
//
// // var conn = peer.connect('Qma9T5YraSnpRDZqRR4krcSJabThc8nwZuJV3LercPHufi');
//
//
//
//     peer.on('open', function (id) {
//         console.log('id', id);
//
//
//         var peerId = inputValue || id;
//         console.log(peerId);
//         var conn = peer.connect(peerId);
//
//         conn.send('hi!');
//         console.log("Send");
//     });
//
//
//     peer.on('connection', function (conn) {
//
//         console.log("Perr Connetcted", conn);
//         conn.on('data', function (data) {
//             // Will print 'hi!'
//             console.log(data);
//         });
//     });
//
// }

