var socket = io('http://localhost:3000');
var config = {iceServers: [{ url: "stun:stun.l.google.com:19302" }]};

var connection = {
    optional: [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }]
};

var search = window.location.search.split(/[^a-z0-9]/g);
var user = search[1];
var user2 = search[2];
var peerConnection;
var dataChannel;

openDataChannel();

function openDataChannel () {
    peerConnection = new RTCPeerConnection(config, connection);

    peerConnection.onicecandidate = function (e) {
        // setTimeout(function () {
        console.log('onicecandidate', e);
        if (!peerConnection || !e || !e.candidate) return;
        var candidate = e.candidate;
        console.log("candidate", candidate);
        sendNegotiation("candidate", candidate);
        // }, 2000);
    };

    console.log("Location", window.location.search.split(/[^a-z0-9]/g));
    console.log("peerConnection", peerConnection);

    dataChannel = peerConnection.createDataChannel('datachannel', {reliable: false});

    dataChannel.onopen = function () {
        console.log("----------------Data channel open---------------");
    };

    dataChannel.onclose = function () {
        console.log("-------------DC closed -----------");
    };

    dataChannel.onerror = function () {
        console.log("------------DC ERROR! --------------");
    };

    peerConnection.ondatachannel = function (ev) {
        console.log('peerConnection.ondatachannel event fired.');
        ev.channel.onopen = function() {
            console.log('Data channel is open and ready to be used.');
        };
        ev.channel.onmessage = function(e){
            console.log("DC from ["+user2+"]:" +e.data);

        }
    };

    return peerConnection;
}

function connectTo(e){
    console.log(e);
    user2 = e;
    openDataChannel();

    var sdpConstraints = {'mandatory':
        {
            'OfferToReceiveAudio': false,
            'OfferToReceiveVideo': false
        }
    };

    peerConnection.createOffer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendNegotiation("offer", sdp);
        console.log("------ SEND OFFER ------");
    }, null, sdpConstraints);
}

function processIce(iceCandidate) {
    console.log("Get ice candidates", iceCandidate);
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
}

function processAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("------ PROCESSED ANSWER ------");
}

function sendNegotiation(type, sdp) {

    var json = { from: user, to: user2, action: type, data: sdp};
    socket.emit('message', json);

    console.log("SDP", type, sdp);
}

socket.on('message', function (e) {
    console.log("message", e);
    var json = e;


    if(json.action === 'candidate') {
        if(json.to === user) {
            processIce(json.data);
        }
        console.log("CANDIDATE", json, json.to, json.from);

    } else if(json.action === 'offer') {
        if(json.to === user) {
        console.log("JSON offer", json.to, json.from);
            user2 = json.from;
            processOffer(json.data);
        }
    } else if(json.action === 'answer') {
        console.log("ANSWER", json.to, json.from);
        if(json.to == user){
            processAnswer(json.data);
        }

    }
});

function processOffer(offer){
    var peerConnection = openDataChannel();
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch(e => {
        console.log(e)
    });
    var sdpConstraints = {'mandatory':
        {
            'OfferToReceiveAudio': false,
            'OfferToReceiveVideo': false
        }
    };
    peerConnection.createAnswer(sdpConstraints).then(function (sdp) {
        return peerConnection.setLocalDescription(sdp).then(function() {
            sendNegotiation("answer", sdp);
            console.log("------ SEND ANSWER ------");
        })
    }, function(err) {
        console.log(err)
    });
    console.log("------ PROCESSED OFFER ------");
};






