import { useStore } from "vuex";
const store = useStore();
console.log(store);

export const test = useStore();

// export const onOffer = (offer: any, userId: any) => {
//     console.log("offer");

//     // x1
//     // sending answer
//     peers[userId] = new RTCPeerConnection(state.iceServers);
//     peers[userId].onicecandidate = (e: any) =>
//       OnIceCandidateFunction(e, userId, state);
//     peers[userId].ontrack = (e: any) => OnTrackFunction(e, userId);
//     const cam = getters.getCamStream;

//     cam.getTracks().forEach((track: MediaStreamTrack) => {
//       peers[userId].addTrack(track, cam); // type : MediaStreamTrack
//     });

//     peers[userId]
//       .setRemoteDescription(new RTCSessionDescription(offer))
//       .then(async () => {
//         peers[userId]
//           .createAnswer()
//           .then((answer: any) => {
//             peers[userId]
//               .setLocalDescription(answer)
//               .catch((err: any) => console.log(err));
//             state.socket.emit("answer", answer, userId); // only send answer to specific user
//           })
//           .catch((err: any) => console.log(err));
//       })
//       .catch((err: any) => console.log(err));
//   }
// }
