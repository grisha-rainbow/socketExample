var socket = io('http://localhost:3000');

//navigator.getWebcam = (navigator.getUserMedia ||
//                       navigator.webkitGetUserMedia ||
//                       navigator.mozGetUserMedia ||
//                       navigator.msGetUserMedia);

//var peer = new Peer({key: 'test1',
//                    debug: 3,
//                    config: {'iceServers': [
//                        {url: 'http://localhost:3000'},
//                        {url: 'http://localhost:3000'},
//                    ]}});

console.log(navigator);
var canvas = document.querySelector('canvas');
var video = document.getElementById('my-video');

var pc1;
var pc2;
var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

var startTime;


if (video) {
    video.addEventListener('loadedmetadata', function() {
        console.log('Remote video videoWidth: ' + this.videoWidth +
            'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    video.onresize = function() {
        console.log('Remote video size changed to ' +
            video.videoWidth + 'x' + video.videoHeight);
        // We'll use the first onsize callback as an indication that video has started
        // playing out.
        if (startTime) {
            var elapsedTime = window.performance.now() - startTime;
            console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
            startTime = null;
        }
    };
}


// Call main() in demo.js
//main();

var stream = canvas.captureStream();
console.log('Got stream from canvas');
console.log("Stream", stream);


pc1 = new RTCPeerConnection();

console.log("pc1", pc1);

// socket.emit('video-from-client', {
//     data: stream
// });
//
// socket.on('send-video-backend', function (evt) {
//     console.log(evt.data);
//     stream = evt.data;
// });

call();

function call() {
    console.log('Starting call');
    startTime = window.performance.now();
    var videoTracks = stream.getVideoTracks();
    var audioTracks = stream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.log('Using video device: ' + videoTracks[0].label);
    }

    if (audioTracks.length > 0) {
        console.log('Using audio device: ' + audioTracks[0].label);
    }
    var servers = null;

    // var servers = {
    //     iceServers: [     // Information about ICE servers - Use your own!
    //         {
    //             urls: "turn:" + 'localhost:3000',  // A TURN server
    //             username: "webrtc",
    //             credential: "turnserver"
    //         },
    //         {
    //             urls: "stun:" + 'localhost:3000',  // A TURN server
    //             username: "webrtc",
    //             credential: "turnserver"
    //         }
    //     ]
    // };

    pc1 = new RTCPeerConnection(servers);
    console.log('Created local peer connection object pc1', pc1);
    pc1.onicecandidate = function(e) {
        onIceCandidate(pc1, e);
    };
    pc2 = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object pc2', pc2);
    pc2.onicecandidate = function(e) {
        onIceCandidate(pc2, e);
    };

    pc1.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc1, e);
    };

    pc2.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc2, e);
    };

    pc2.ontrack = gotRemoteStream;

    stream.getTracks().forEach(
        function(track) {
            pc1.addTrack(
                track,
                stream
            );
        }
    );
    console.log('Added local stream to pc1');

    console.log('pc1 createOffer start');
    pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError,
        offerOptions);
}

function onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc) {
    console.log('Offer from pc1\n' + desc.sdp);
    console.log('pc1 setLocalDescription start');
    pc1.setLocalDescription(desc, function() {
        onSetLocalSuccess(pc1);
    }, onSetSessionDescriptionError);
    console.log('pc2 setRemoteDescription start');
    pc2.setRemoteDescription(desc, function() {
        onSetRemoteSuccess(pc2);
    }, onSetSessionDescriptionError);
    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
    console.log(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
    console.log(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
    console.log('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(e) {
    if (video.srcObject !== e.streams[0]) {
        video.srcObject = e.streams[0];
        console.log('pc2 received remote stream');
    }
}

function onCreateAnswerSuccess(desc) {
    console.log('Answer from pc2:\n' + desc.sdp);
    console.log('pc2 setLocalDescription start');
    pc2.setLocalDescription(desc, function() {
        onSetLocalSuccess(pc2);
    }, onSetSessionDescriptionError);
    console.log('pc1 setRemoteDescription start');
    pc1.setRemoteDescription(desc, function() {
        onSetRemoteSuccess(pc1);
    }, onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
    getOtherPc(pc).addIceCandidate(event.candidate)
        .then(
            function() {
                onAddIceCandidateSuccess(pc);
            },
            function(err) {
                onAddIceCandidateError(pc, err);
            }
        );
    console.log(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
            event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess(pc) {
    console.log(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
    console.log(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
    if (pc) {
        console.log(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
        console.log('ICE state change event: ', event);
    }
}

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}