let socket = io.connect("/");
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-grid");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let roomInput = document.getElementById("roomName");
let roomName;
let creator = false;
let rtcPeerConnection;
let userStream;

// send to front only encoded ids for identifying and display the users. only the server can decode it.

// Contains the stun server URL we will be using.
let iceServers = {
  iceServers: [
    {
      urls: "stun:stun.services.mozilla.com",
    },
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

joinButton.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
    socket.emit("join", roomName);
  }
});

// Triggered when a room is succesfully created.
// get "getUserMedia" function for other browsers

// get "getUserMedia" function for other browsers
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

const USERMEDIA = {
  audio: true,
  video: {
    width: 1280,
    height: 720,
  },
};

const getMediaDevices = () => {
  if (navigator.mediaDevices) {
    // if navigator.mediaDevices exists, use it
    return navigator.mediaDevices.getUserMedia(USERMEDIA);
  } else {
    return navigator.getUserMedia(USERMEDIA);
  }
};

const getMediaDevicesSuccessCreated = stream => {
  /* use the stream */
  userStream = stream;
  divVideoChatLobby.style = "display:none";
  userVideo.srcObject = stream;
  userVideo.muted = true;
  userVideo.onloadedmetadata = function (e) {
    userVideo.play();
  };
}

const getMediaDevicesSuccessJoined = stream => {
  /* use the stream */
  userStream = stream;
  divVideoChatLobby.style = "display:none";
  userVideo.srcObject = stream;
  userVideo.onloadedmetadata = function (e) {
    userVideo.play();
  };

  console.log("joined then ready");
  socket.emit("ready", roomName);
}

const getMediaDevicesError = () => {
  /* handle the error */
  console.log(err);
  alert("Couldn't Access User Media");
};

socket.on("created", function () {
  creator = true;
  getMediaDevices()
    .then(getMediaDevicesSuccessCreated)
    .catch(getMediaDevicesError);
});

// Triggered when a room is succesfully joined.

socket.on("joined", function () {
  console.log("joined front");

  creator = false;

  getMediaDevices()
    .then(getMediaDevicesSuccessJoined)
    .catch(getMediaDevicesError);
});

// Triggered when a room is full (meaning has 2 people).

socket.on("full", function () {
  alert("Room is Full, Can't Join");
});

// Triggered when a peer has joined the room and ready to communicate.

socket.on("ready", function (userId) {
  console.log("ready");

  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    // x multiple times...
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = (e) => OnTrackFunction(e, userId);
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    console.log("creating offer");
    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        console.log("recieving offer");
        rtcPeerConnection.setLocalDescription(offer);
        // x1
        socket.emit("offer", offer, roomName);
      })
      .catch((error) => {
        console.log("error");
        console.log(error);
      });
  }
});

// Triggered on receiving an ice candidate from the peer.

socket.on("candidate", function (candidate) {
  console.log("candidate", candidate.candidate);
  let icecandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(icecandidate);
});

// Triggered on receiving an offer from the person who created the room.

socket.on("offer", function (offer, userId) {
  // x1
  console.log("offer");
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    // multiple times
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    console.log("will launch OnTrackFunction", rtcPeerConnection);
    // double event triggered if video and audio is requested
    rtcPeerConnection.ontrack = (e) => OnTrackFunction(e, userId);
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        // x1
        console.log("offer then answer");
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

// Triggered on receiving an answer from the person who joined the room.

socket.on("answer", function (answer) {
  // x1
  console.log("anwser");
  rtcPeerConnection.setRemoteDescription(answer);
});

// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.

// bouger tout ça dans node car ce n'est pas normal que dans l'event j'ai l'adresse ip du user
function OnIceCandidateFunction(event) {
  if (event.candidate) {
    console.log("OnIceCandidateFunction", event.candidate.candidate);
    socket.emit("candidate", event.candidate, roomName);
  }
}

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.

function OnTrackFunction(event, userId) {
  // double event triggered if video and audio is requested

  const trackKind = event?.track?.kind;
  console.log("OnTrackFunction ", trackKind);

  if (!trackKind) return null;

  if (trackKind === "video") {
    const newPeerVideo = document.createElement("video");
    newPeerVideo.setAttribute("id", userId);
    divVideoChat.appendChild(newPeerVideo);
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = function (e) {
      newPeerVideo.play();
    };
  } else if (trackKind === "audio") {
    // where in the project is set the audio so I can mute the person I'm talking to / mute myself ?
    const newPeerAudio = document.createElement("audio");
    newPeerAudio.setAttribute("id", "audio" + userId);
    newPeerAudio.setAttribute("controls", true);
    divVideoChat.appendChild(newPeerAudio);
    newPeerAudio.srcObject = event.streams[0];
    newPeerAudio.onloadedmetadata = function (e) {
      newPeerAudio.play();
    };
  }
}

// connection via un autre pc ==> Uncaught (in promise) DOMException: Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote answer sdp: Called in wrong state: stable
// probleme de connexion à socket

// Disconnect user if he leaves
socket.on("user-disconnected", (userId) => {
  console.log("disconnected");
  document.getElementById(userId).remove();
});
