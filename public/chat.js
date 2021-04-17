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
let senders = {};

joinButton.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
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
    width: 176,
    height: 144,
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

const getMediaDevicesSuccessCreated = (stream) => {
  /* use the stream */
  userStream = stream;
  divVideoChatLobby.style = "display:none";
  userVideo.srcObject = stream;
  userVideo.muted = true;
  userVideo.onloadedmetadata = function (e) {
    userVideo.play();
  };
};

const getMediaDevicesSuccessJoined = (stream) => {
  /* use the stream */
  userStream = stream;
  divVideoChatLobby.style = "display:none";
  userVideo.srcObject = stream;
  userVideo.onloadedmetadata = function (e) {
    userVideo.play();
  };

  socket.emit("ready", roomName);
};

const getMediaDevicesError = (err) => alert("Couldn't Access User Media");

socket.on("created", function () {
  creator = true;
  getMediaDevices()
    .then(getMediaDevicesSuccessCreated)
    .catch(getMediaDevicesError);
});

// Triggered when a room is succesfully joined.
socket.on("joined", function () {
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
  // generating offer
  peers[userId] = new RTCPeerConnection(iceServers);
  peers[userId].onicecandidate = (e) => OnIceCandidateFunction(e, userId);
  peers[userId].ontrack = (e) => OnTrackFunction(e, userId);

  userStream.getTracks().forEach((track) => {
    peers[userId].addTrack(track, userStream); // type : MediaStreamTrack
  });

  peers[userId]
    .createOffer()
    .then((offer) => {
      peers[userId]
        .setLocalDescription(new RTCSessionDescription(offer))
        .then(async () => {
          socket.emit("offer", offer, userId); // reply only to user ready
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// Triggered on receiving an ice candidate from the peer.
socket.on("candidate", function (candidate, userId) {
  peers[userId].addIceCandidate(candidate).catch((err) => console.log(err));
});

// Triggered on receiving an offer from the person who created the room.
socket.on("offer", function (offer, userId) {
  // x1
  // sending answer
  peers[userId] = new RTCPeerConnection(iceServers);
  peers[userId].onicecandidate = (e) => OnIceCandidateFunction(e, userId);
  peers[userId].ontrack = (e) => OnTrackFunction(e, userId);

  userStream.getTracks().forEach((track) => {
    peers[userId].addTrack(track, userStream); // type : MediaStreamTrack
  });

  peers[userId]
    .setRemoteDescription(new RTCSessionDescription(offer))
    .then(async () => {
      peers[userId]
        .createAnswer()
        .then((answer) => {
          peers[userId]
            .setLocalDescription(answer)
            .catch((err) => console.log(err));
          socket.emit("answer", answer, userId); // only send answer to specific user
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// Triggered on receiving an answer from the person who joined the room.

socket.on("answer", function (answer, userId) {
  peers[userId]
    .setRemoteDescription(new RTCSessionDescription(answer))
    .catch((err) => console.log(err));
});

// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.
function OnIceCandidateFunction(event, userToReplyTo) {
  if (event.candidate) {
    socket.emit("candidate", event.candidate, userToReplyTo);
  }
}

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.

function OnTrackFunction(event, userId) {
  const trackKind = event?.track?.kind;

  if (trackKind === "video") {
    const newPeerVideo = document.createElement("video");
    newPeerVideo.setAttribute("id", userId);
    divVideoChat.appendChild(newPeerVideo);
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = function (e) {
      newPeerVideo.play();
    };
  }
}

// Disconnect user if he leaves
socket.on("user-disconnected", (userId) => {
  document.getElementById(userId).remove();
  peers[userId].close();
});

document.getElementById("hangUp").addEventListener("click", (e) => {
  const quit = window.confirm("Do you want to quit the call ?");

  if (quit) {
    socket.emit("force-disconnect", roomName);
    Object.keys(peers).forEach((id) => peers[id].close());
    document.body.innerHTML = "Disconnected";
  }
});

document.getElementById("hideVideo").addEventListener("click", () => {
  Object.keys(peers).forEach((id) => {
    const senders = peers[id].getSenders();

    senders.forEach((sender) => {
      if (sender.track.kind === "video") {
        sender.track.enabled = false;
      }
    });
  });
});

document.getElementById("showVideo").addEventListener("click", () => {
  Object.keys(peers).forEach((id) => {
    const senders = peers[id].getSenders();
    senders.forEach((sender) => {
      if (sender.track.kind === "video") {
        sender.track.enabled = true;
      }
    });
  });
});

// alternatives : removeTrack ou replaceTrack...
document.getElementById("muteAudio").addEventListener("click", () => {
  Object.keys(peers).forEach((id) => {
    const senders = peers[id].getSenders();
    senders.forEach((sender) => {
      if (sender.track.kind === "audio") {
        sender.track.enabled = false;
      }
    });
  });
});

document.getElementById("enableAudio").addEventListener("click", () => {
  Object.keys(peers).forEach((id) => {
    const senders = peers[id].getSenders();
    senders.forEach((sender) => {
      if (sender.track.kind === "audio") {
        sender.track.enabled = true;
      }
    });
  });
});
