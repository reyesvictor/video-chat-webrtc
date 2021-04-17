let socket = io.connect("/");
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-grid");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let roomInput = document.getElementById("roomName");
let roomName;
let creator = false;

let userStream;

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

let peers = {};

joinButton.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
    console.log("emit join 🤙");
    socket.emit("join", roomName);
  }
});

// Triggered when a room is succesfully created.
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

  console.log("emit ready 🤙");
  socket.emit("ready", roomName);
}

const getMediaDevicesError = err => {
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

  // generating offer
  peers[userId] = new RTCPeerConnection(iceServers);
  peers[userId].onicecandidate = OnIceCandidateFunction;
  peers[userId].ontrack = (e) => OnTrackFunction(e, userId);

  userStream.getTracks().forEach(track => {
    peers[userId].addTrack(track, userStream); // type : MediaStreamTrack
  });

  peers[userId].createOffer().then((offer) => {
    console.log("ready createOffer");

    peers[userId].setLocalDescription(new RTCSessionDescription(offer)).then(async () => {
      console.log("ready setLocalDescription 😎 emit offer 🤙");
      socket.emit("offer", offer, userId); // reply only to user ready
    }).catch((error) => {
      console.log('error', error);
    });
  }).catch((error) => {
    console.log('error', error);
  });
});

// Triggered on receiving an ice candidate from the peer.

socket.on("candidate", function (candidate, userId) {
  // console.log("candidate", candidate.candidate);
  // console.log(userId, peers[userId].signalingState);
  console.log('candidate 🚕 ', userId, peers[userId].signalingState);
  peers[userId].addIceCandidate(new RTCIceCandidate(candidate));
});

// Triggered on receiving an offer from the person who created the room.

socket.on("offer", function (offer, userId) {
  // x1
  console.log("recieving offer 📲");
  // sending answer
  peers[userId] = new RTCPeerConnection(iceServers);
  peers[userId].onicecandidate = OnIceCandidateFunction;
  peers[userId].ontrack = (e) => OnTrackFunction(e, userId);

  userStream.getTracks().forEach(track => {
    peers[userId].addTrack(track, userStream); // type : MediaStreamTrack
  });

  peers[userId].setRemoteDescription(new RTCSessionDescription(offer)).then(async () => {
    console.log("offer setRemoteDescription 👽");

    peers[userId].createAnswer().then(answer => {
      console.log("offer createAnswer");
      peers[userId].setLocalDescription(answer)
      console.log("offer setLocalDescription 😎 emit answer 🤙");

      socket.emit("answer", answer, userId); // only send answer to specific user
    }).catch((error) => {
      console.log(error);
    });
  }).catch((error) => {
    console.log(error);
  });
});

// Triggered on receiving an answer from the person who joined the room.

socket.on("answer", function (answer, userId) {
  console.log("recieving anwser 📲");
  //, userId, "peers", peers, 'state', rtcPeerConnection.signalingState

  peers[userId].setRemoteDescription(new RTCSessionDescription(answer))
  console.log('anwser setRemoteDescription 👽');
});

// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.

// bouger tout ça dans node car ce n'est pas normal que dans l'event j'ai l'adresse ip du user
function OnIceCandidateFunction(event) {
  if (event.candidate) {
    console.log("OnIceCandidateFunction");
    socket.emit("candidate", event.candidate, roomName);
  }
}

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.

function OnTrackFunction(event, userId) {
  const trackKind = event?.track?.kind;
  console.log(" eventHandler OnTrackFunction 👽", trackKind);

  if (!trackKind) return null;

  if (trackKind === "video") {
    const newPeerVideo = document.createElement("video");
    newPeerVideo.setAttribute("id", userId);
    divVideoChat.appendChild(newPeerVideo);
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = function (e) {
      console.log('onloadedmetadata 📺 ---------------------------------------------------------------');
      newPeerVideo.play();
    };
  }
}

// Disconnect user if he leaves
socket.on("user-disconnected", (userId) => {
  console.log("disconnected 📲");
  document.getElementById(userId).remove();
});
