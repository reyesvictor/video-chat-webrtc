import { toggleFullscreen } from "./StreamService";
import { CAM_TYPE, SCREEN_TYPE } from "./../store/modules/utils";
import { handleCatch } from "@/store/modules/utils";
import { IceServer, StreamTrade } from "./../store/modules/types";
import { track } from "logrocket";

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
  if (!trackKind) return false;

  console.log("🔎 OnTrackFunction: ", trackKind);
  let id = peerId;
  const htmlElement: HTMLVideoElement | HTMLAudioElement =
    document.createElement(trackKind);

  if (trackKind === "video") {
    htmlElement.style.background = "purple";
    htmlElement.muted = true;
  } else if (trackKind === "audio") {
    id = "audio-" + "peerId";
  }

  htmlElement.setAttribute("id", id);
  htmlElement.srcObject = event.streams[0];
  htmlElement.onloadedmetadata = () => {
    console.log("🔎 onloadedmedata: ", trackKind);
    htmlElement.play();
  };
  htmlElement.onclick = (e: Event) => {
    e.target?.addEventListener("click", () => {
      toggleFullscreen("#" + id);
    });
  };

  doc.getElementById(trackKind + "-grid").appendChild(htmlElement);
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
  peer.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  peer.ontrack = (e: RTCTrackEvent) =>
    OnTrackFunction(e, userId + streamTrade.joined);
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
  peer.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
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

  peer.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  peer.ontrack = (e: RTCTrackEvent) => OnTrackFunction(e, peerId);
  addTracks(stream, peer);
  createOffer(peer, state, userId, streamTrade);
};

export const sendScreenOffer = ({
  peer,
  stream,
  userId,
  state,
  joinedStreamType,
}: SendOffer) => {
  console.log("sendScreenOffer");
  const streamTrade = {
    joined: joinedStreamType,
    present: SCREEN_TYPE,
  };

  peer.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
    OnIceCandidateFunction(e, userId, state, streamTrade);
  addTracks(stream, peer);
  createOffer(peer, state, userId, streamTrade);
};
