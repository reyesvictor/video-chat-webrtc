// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.
export const OnIceCandidateFunction = (
  event: any,
  userToReplyTo: any,
  state: any
) => {
  if (event.candidate) {
    state.socket.emit("candidate", event.candidate, userToReplyTo);
  }
};

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.
export const OnTrackFunction = (event: any, userId: any) => {
  const trackKind = event?.track?.kind;

  const docu: any = document;
  if (trackKind === "video") {
    const newPeerVideo = document.createElement("video");
    newPeerVideo.setAttribute("id", userId);
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = function (e) {
      newPeerVideo.play();
    };

    docu.getElementById("video-grid").appendChild(newPeerVideo);
  }
};
