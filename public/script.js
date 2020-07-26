const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
const myVideo = document.createElement('video');
myVideo.muted = true;

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
    console.log(`connecting ${userId}`);
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', newUserStream => {
        console.log(`calling ${userId}`);
        addVideoStream(video, newUserStream);
    });
    call.on('close', () => {
        video.remove();
    });
}

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true
    })
    .then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {
            console.log(`answering ${call}`);
            // console.log('answering call');
            call.answer(stream);
        });

        socket.on('user-connected', userId => {
            console.log(`user connected`);
            connectToNewUser(userId, stream);
        });
    });

myPeer.on('open', id => {
    // console.log('join room');
    socket.emit('join-room', ROOM_ID, id);
});
