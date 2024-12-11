// Import Socket.IO and PeerJS
const socket = io('/');
const videoGrid = document.getElementById('video-grid');

// Initialize PeerJS with configuration
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
});

// Create the user's video element
const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

// Function to initialize media stream
async function initializeStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Add the user's video stream
    addVideoStream(myVideo, stream);

    // Handle incoming calls
    myPeer.on('call', (call) => handleIncomingCall(call, stream));

    // Listen for new user connections
    socket.on('user-connected', (userId) => connectToNewUser(userId, stream));
  } catch (error) {
    console.error('Failed to get local stream:', error);
  }
}

// Handle new user connections
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
  call.on('close', () => video.remove());

  // Handle call errors
  call.on('error', (error) => {
    console.error('Call error:', error);
  });

  peers[userId] = call;
}

// Handle incoming calls
function handleIncomingCall(call, stream) {
  call.answer(stream);

  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
}

// Handle user disconnections
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }
});

// Notify server when peer connection is established
myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

// Utility function to add video streams to the DOM
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.appendChild(video);
}

// Initialize the application
initializeStream();
