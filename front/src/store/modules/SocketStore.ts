import { toast } from "../../services/ToastService";
import io, { Socket } from "socket.io-client";
import router from "@/router/index";
import {
  OnIceCandidateFunction,
  OnTrackFunction,
} from "../../services/RTCPService";

const myIO: any = io;

interface SocketState {
  socket: Socket;
}

interface SocketCallback {
  success: string;
  err: string;
  id: string;
}

export default {
  namespaced: true,
  state: {
    socket: {
      type: Socket,
      required: false,
    },
  },
  mutations: {
    CONNECT(state: SocketState) {
      state.socket = myIO.connect("http://localhost:4000");
    },
  },
  actions: {
    connect({ state, commit, getters }: any) {
      commit("CONNECT");

      const socket = state.socket;
      const peers = getters.getPeers;
      const cam = getters.getCamStream;

      socket.on("ready", function (userId: number | string) {
        console.log("ready");
        const cam = getters.getCamStream;

        console.log(cam);

        // generating offer
        peers[userId] = new RTCPeerConnection(state.iceServers);
        peers[userId].onicecandidate = (e: any) =>
          OnIceCandidateFunction(e, userId, state);
        peers[userId].ontrack = (e: any) => OnTrackFunction(e, userId);

        cam.getTracks().forEach((track: MediaStreamTrack) => {
          peers[userId].addTrack(track, cam); // type : MediaStreamTrack
        });

        peers[userId]
          .createOffer()
          .then((offer: any) => {
            peers[userId]
              .setLocalDescription(new RTCSessionDescription(offer))
              .then(async () => {
                state.socket.emit("offer", offer, userId); // reply only to user ready
              })
              .catch((err: string) => console.log(err));
          })
          .catch((err: string) => console.log(err));
      });

      socket.on("offer", function (offer: any, userId: any) {
        console.log("offer");

        peers[userId] = new RTCPeerConnection(state.iceServers);
        peers[userId].onicecandidate = (e: any) =>
          OnIceCandidateFunction(e, userId, state);
        peers[userId].ontrack = (e: any) => OnTrackFunction(e, userId);

        cam.getTracks().forEach((track: MediaStreamTrack) => {
          peers[userId].addTrack(track, cam);
        });

        peers[userId]
          .setRemoteDescription(new RTCSessionDescription(offer))
          .then(async () => {
            peers[userId]
              .createAnswer()
              .then((answer: any) => {
                peers[userId]
                  .setLocalDescription(answer)
                  .catch((err: any) => console.log(err));
                state.socket.emit("answer", answer, userId); // only send answer to specific user
              })
              .catch((err: any) => console.log(err));
          })
          .catch((err: any) => console.log(err));
      });

      socket.on("candidate", function (candidate: any, userId: any) {
        peers[userId]
          .addIceCandidate(candidate)
          .catch((err: any) => console.log(err));
      });

      socket.on("answer", function (answer: any, userId: any) {
        peers[userId]
          .setRemoteDescription(new RTCSessionDescription(answer))
          .catch((err: any) => console.log(err));
      });

      socket.on("user-disconnected", (userId: string) => {
        document.getElementById(userId)?.remove();

        const name = document.getElementById("name-" + userId);
        if (name) name.remove();

        const img = document.getElementById("img-" + userId);
        if (img) img.remove();

        state.peers[userId].close();
      });
    },
    create({ state }: any) {
      state.socket.emit(
        "vue-create",
        ({ success, err, id }: SocketCallback) => {
          if (err) {
            toast("error", err);
          } else {
            toast("success", success);
            router.push({ name: "Room", params: { id } });

            // do more code
            // to begin lets assume every user will activate his webcam
          }
        }
      );
    },
    join({ state }: any) {
      return state.socket.emit(
        "vue-join",
        router.currentRoute.value.params.id,
        ({ success, err }: SocketCallback) => {
          if (err) {
            toast("error", err);
            return false;
          } else {
            toast("success", success);
            return true;
          }
        }
      );
    },
    hangUp({ state }: any) {
      console.log("hangUp socket store");

      return state.socket.emit(
        "force-disconnect",
        ({ success, err }: SocketCallback) => {
          if (err) {
            toast("error", err);
            return false;
          } else {
            toast("success", success);
            return true;
          }
        }
      );
    },
  },
  getters: {
    getSocket(state: SocketState) {
      return state.socket;
    },
    getCamStream(_: any, _1: any, rootState: any) {
      return rootState.rtcp.user.streams.cam;
    },
    getPeers(_: any, _1: any, rootState: any) {
      return rootState.rtcp.peers;
    },
  },
};
