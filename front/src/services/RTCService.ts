import SocketStore from "@/store/modules/SocketStore";
import { StreamCommunication } from "./../store/modules/types";
export const OnIceCandidateFunction = (
  event: any,
  userToReplyTo: string,
  state: any,
  streamCommunication: StreamCommunication
) => {
  if (event.candidate) {
    // comment faire pour savoir quel candidte communique a quel offre ???
    console.log("OnIceCandidateFunction: ", streamCommunication);
    state.socket.emit(
      "candidate",
      event.candidate,
      userToReplyTo,
      streamCommunication
    );
  }
};

export const OnTrackFunction = (
  event: any,
  userId: any,
  streamJoinedType: string
) => {
  const trackKind = event?.track?.kind;

  const docu: any = document;
  if (trackKind === "video") {
    const newPeerVideo = document.createElement("video");
    newPeerVideo.setAttribute("id", userId + streamJoinedType);
    console.log(event.streams, event.streams[0], "===========");
    newPeerVideo.srcObject = event.streams[0];
    newPeerVideo.onloadedmetadata = () => {
      console.log("onloadedmedata 🍞");

      newPeerVideo.play();
    };

    console.log("onTrackFunction appendChild: ", userId + streamJoinedType);
    docu.getElementById("video-grid").appendChild(newPeerVideo);
  }
};
