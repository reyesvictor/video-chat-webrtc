import { CAM_TYPE, SCREEN_TYPE } from "./../store/modules/utils";
import { handleCatch } from "@/store/modules/utils";
import { IceServer, StreamTrade } from "./../store/modules/types";

export const iceServers: IceServer[] = [
  {
    urls: "stun:stun.services.mozilla.com",
  },
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

export const OnIceCandidateFunction = (
  event: any,
  userToReplyTo: string,
  state: any,
  streamTrade: StreamTrade
) => {
  if (event.candidate) {
    console.log("OnIceCandidateFunction: ", streamTrade);
    state.socket.emit("candidate", event.candidate, userToReplyTo, streamTrade);
  }
};

export const doc: any = document;

export const OnTrackFunction = (event: any, peerId: string) => {
  const trackKind = event?.track?.kind;

  if (trackKind === "video") {
    const newPeerVideo: HTMLVideoElement = document.createElement("video");
    newPeerVideo.setAttribute("id", peerId);
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = () => {
      newPeerVideo.play();
    };

    newPeerVideo.onclick = (e: Event) => {
      e.target?.addEventListener("click", () => {
        toggleFullscreen("#" + peerId);
      });
    };
    doc.getElementById("video-grid").appendChild(newPeerVideo);
  }
};

export const addTracks = (stream: MediaStream, peer: RTCPeerConnection) =>
  stream.getTracks().forEach((track: MediaStreamTrack) => {
    peer.addTrack(track, stream);
  });

export const createOffer = (
  peer: RTCPeerConnection,
  state: any,
  userId: string,
  streamTrade: StreamTrade
) => {
  peer
    .createOffer()
    .then((offer: RTCSessionDescriptionInit) => {
      peer
        .setLocalDescription(new RTCSessionDescription(offer))
        .then(async () => {
          state.socket.emit("offer", offer, userId, streamTrade);
        })
        .catch(handleCatch);
    })
    .catch(handleCatch);
};

export const setRemoteDescription = (
  peer: RTCPeerConnection,
  offer: RTCSessionDescriptionInit,
  state: any,
  userId: string,
  streamTrade: StreamTrade
) => {
  peer
    .setRemoteDescription(new RTCSessionDescription(offer))
    .then(async () => {
      peer
        .createAnswer()
        .then((answer: RTCSessionDescriptionInit) => {
          peer.setLocalDescription(answer).catch(handleCatch);
          state.socket.emit("answer", answer, userId, streamTrade);
        })
        .catch(handleCatch);
    })
    .catch(handleCatch);
};

interface SendAnswer {
  peer: RTCPeerConnection;
  stream: MediaStream;
  userId: string;
  state: any;
  streamTrade: StreamTrade;
  offer: RTCSessionDescriptionInit;
}

export const sendCamAnswer = ({
  peer,
  stream,
  userId,
  state,
  streamTrade,
  offer,
}: SendAnswer) => {
  console.log("sendCamAnswer");
  peer.onicecandidate = (e: any) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  peer.ontrack = (e: any) => OnTrackFunction(e, userId + streamTrade.joined);
  addTracks(stream, peer);
  setRemoteDescription(peer, offer, state, userId, streamTrade);
};

export const sendScreenAnswer = ({
  peer,
  stream,
  userId,
  state,
  streamTrade,
  offer,
}: SendAnswer) => {
  console.log("sendScreenAnswer");
  peer.onicecandidate = (e: any) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);

  addTracks(stream, peer);
  setRemoteDescription(peer, offer, state, userId, streamTrade);
};

interface SendOffer {
  peer: RTCPeerConnection;
  stream: MediaStream;
  userId: string;
  state: any;
  joinedStreamType: string;
  peerId: string;
}

export const sendCamOffer = ({
  peer,
  stream,
  userId,
  state,
  joinedStreamType,
  peerId,
}: SendOffer) => {
  console.log("sendCamOffer");
  const streamTrade = {
    joined: joinedStreamType,
    present: CAM_TYPE,
  };

  peer.onicecandidate = (e: any) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  peer.ontrack = (e: any) => OnTrackFunction(e, peerId);
  addTracks(stream, peer);
  createOffer(peer, state, userId, streamTrade);
};

export const sendScreenOffer = ({
  peer,
  stream,
  userId,
  state,
  joinedStreamType,
  peerId,
}: SendOffer) => {
  console.log("sendScreenOffer");
  const streamTrade = {
    joined: joinedStreamType,
    present: SCREEN_TYPE,
  };

  peer.onicecandidate = (e: any) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  addTracks(stream, peer);
  createOffer(peer, state, userId, streamTrade);
};

export const getFullscreenElement = () => {
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullscreenElement ||
    doc.msFullscreenElement
  );
};

export const toggleFullscreen = (selector: string) => {
  if (selector.length === 0) {
    return handleCatch(
      "Selector to toggle video element in fullscreen does not exist"
    );
  }

  console.log("toggleFullscreen: ", selector);
  if (getFullscreenElement()) {
    document.exitFullscreen();
  } else {
    document.querySelector(selector)?.requestFullscreen().catch(console.log);
  }
};
