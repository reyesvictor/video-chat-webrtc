class JoinedPeers {
  constructor() {
    this.peers = {};
  }

  setPeer(userId) {
    this.peers[userId] = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.services.mozilla.com",
        },
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    this.peers[userId].onicecandidate = OnIceCandidateFunction;
    this.peers[userId].ontrack = (e) => OnTrackFunction(e, userId);
  }

  OnIceCandidateFunction(event) {
    if (event.candidate) {
      socket.emit("candidate", event.candidate, roomName);
    }
  }

  OnTrackFunction(event, userId) {
    const trackKind = event?.track?.kind;
    console.log(" eventHandler OnTrackFunction 👽", trackKind);

    if (!trackKind) return null;

    if (trackKind === "video") {
      const newPeerVideo = document.createElement("video");
      newPeerVideo.setAttribute("id", userId);
      divVideoChat.appendChild(newPeerVideo);
      newPeerVideo.srcObject = event.streams[0];
      newPeerVideo.onloadedmetadata = function (e) {
        console.log('onloadedmetadata 📺');
        newPeerVideo.play();
      };
    }
  }

  addTrack(track, userStream, userId) {
    this.peers[userId].addTrack(track, userStream);
  }

  async prepareAll(userId) {
    const peer = this.peers[userId];

    const offer = await peer.createOffer();
    console.log('prepareAll🐺- offer ready');
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    console.log("prepareAll🐺- setLocalDescription");
    socket.emit("offer", offer, roomName);
    console.log("prepareAll🐺- socket emit");
  }

  getPeers() {
    return Object.keys(this.peers);
  }

  addIceCandidate(candidate, userId) {
    this.peers[userId].addIceCandidate(new RTCIceCandidate(candidate))
  }

  getPeer(userId) {
    if (this.peers[userId]) {
      return this.peers[userId];
    }
  }
}

export default JoinedPeers;