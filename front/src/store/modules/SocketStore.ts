import {
  sendCamAnswer,
  sendCamOffer,
  sendScreenAnswer,
  iceServers,
  sendScreenOffer,
} from "./../../services/RTCService";
import {
  CAM_TYPE,
  handleCatch,
  handleSocketResult,
  SCREEN_TYPE,
} from "./utils";
import io, { Socket } from "socket.io-client";
import router from "@/router/index";
import { StreamTrade } from "./types";

const myIO: any = io;

interface SocketState {
  socket: Socket;
}

interface SocketCallback {
  roomId: string;
  err: string;
  success: string;
}

const configuration: RTCConfiguration = { iceServers };

export default {
  namespaced: true,
  state: {
    socket: Socket,
  },
  mutations: {
    CONNECT(state: SocketState) {
      state.socket = myIO.connect(
        // local test
        // "https://e5bd0781885f.ngrok.io" ??
        "http://localhost:4000" ??
          "http://" + window.location.hostname + ":4000"
      );
    },
  },
  actions: {
    connect({ state, commit, getters, rootState, dispatch }: any) {
      if (state.socket?.connected) {
        return;
      }

      commit("CONNECT");
      const socket = state.socket;
      console.log("socket/connect 🎃");
      const camPeers = getters.getCamPeers;
      const screenPeers = getters.getScreenPeers;

      socket.on("ready", (userId: string, joinedStreamType: string) => {
        const cam = getters.getCamStream;
        const peerId = userId + joinedStreamType;
        console.log("ready");

        if (rootState.rtcCam.workflow.video.STARTED) {
          console.log("ready rtcCam");
          // TODO this is a state in the store, I should use an action to creation a new peer...
          camPeers[peerId] = new RTCPeerConnection(configuration);
          const camPeer = camPeers[peerId];

          sendCamOffer({
            joinedStreamType,
            stream: cam,
            peer: camPeer,
            peerId,
            state,
            userId,
          });
        }

        if (
          rootState.rtcScreen.workflow.video.STARTED &&
          joinedStreamType === CAM_TYPE
        ) {
          console.log("ready rtcScreen");
          // TODO this is a state in the store, I should use an action to creation a new peer...
          screenPeers[peerId] = new RTCPeerConnection(configuration);
          const screenPeer = screenPeers[peerId];

          sendScreenOffer({
            joinedStreamType,
            stream: cam,
            peer: screenPeer,
            peerId,
            state,
            userId,
          });
        }
      });

      interface MyRTCOffer extends RTCSessionDescription {
        streamType?: string;
      }

      // TODO rename offer to rtc session description... ==> not clear my dude its wednesday
      socket.on(
        "offer",
        (offer: MyRTCOffer, userId: string, streamTrade: StreamTrade) => {
          console.log("offer -> creating answer");
          const peerId = userId + streamTrade.present;

          if (
            rootState.rtcCam.workflow.video.STARTED &&
            streamTrade.joined === CAM_TYPE
          ) {
            console.log("offer rtcCam inside");

            // TODO move this into action to create the peer inside state with a MUTATION
            camPeers[peerId] = new RTCPeerConnection(configuration);
            const camPeer = camPeers[peerId];
            const cam = getters.getCamStream;

            sendCamAnswer({
              peer: camPeer,
              stream: cam,
              userId,
              state,
              streamTrade,
              offer,
            });
          }

          if (
            rootState.rtcScreen.workflow.video.STARTED &&
            streamTrade.joined === SCREEN_TYPE
          ) {
            console.log("offer rtcScreen inside");

            screenPeers[peerId] = new RTCPeerConnection(configuration);
            const screenPeer = screenPeers[peerId];
            const screen = getters.getScreenStream;

            sendScreenAnswer({
              peer: screenPeer,
              stream: screen,
              userId,
              state,
              streamTrade,
              offer,
            });
          }
        }
      );

      // create socket.on cam-candidate / screen-candidate ? or detect with id ?
      // only need to know the joined stream type
      socket.on(
        "candidate",
        (
          candidate: RTCIceCandidate,
          userId: string,
          streamTrade: StreamTrade
        ) => {
          console.log("socket.on candidate: ", streamTrade);

          if (streamTrade.present === CAM_TYPE) {
            let peer: RTCPeerConnection = new RTCPeerConnection();
            const peerJoinedID: string = userId + streamTrade.joined;
            const peerPresentID: string = userId + streamTrade.joined;

            if (peerJoinedID in camPeers) {
              peer = camPeers[peerJoinedID];
            } else if (peerPresentID in camPeers) {
              peer = camPeers[peerPresentID];
            }
            peer.addIceCandidate(candidate).catch(handleCatch);
          } else if (streamTrade.present === SCREEN_TYPE) {
            screenPeers[userId + streamTrade.present]
              .addIceCandidate(candidate)
              .catch(handleCatch);
          } else {
            handleCatch("❌ Can't set candidate, no peer found");
          }
        }
      );

      socket.on(
        "answer",
        (
          answer: RTCSessionDescription,
          userId: string,
          streamTrade: StreamTrade
        ) => {
          console.log("answer || streamTrade: ", streamTrade);
          let peer: RTCPeerConnection = new RTCPeerConnection();

          if (streamTrade.present === CAM_TYPE) {
            peer = camPeers[userId + streamTrade.joined];
          } else if (streamTrade.present === SCREEN_TYPE) {
            peer = screenPeers[userId + streamTrade.joined];
          } else {
            handleCatch("❌ No peer to set remote description found");
          }

          peer
            .setRemoteDescription(new RTCSessionDescription(answer))
            .catch(handleCatch);
        }
      );

      console.log("socket2", socket);
      // correct this to stream-disconnected
      socket.on("user-disconnected", (userId: string) => {
        dispatch("socket/closeCamStream", userId, { root: true });
        dispatch("socket/closeScreenStream", userId, { root: true });
      });

      socket.on("user-screen-share-disconnected", (userId: string) => {
        console.log("socket.on/user-screen-share-disconnected -> dispatch");

        dispatch("socket/closeScreenStream", userId, { root: true });
      });
    },
    sendCloseScreenStream({ state, rootState }: any) {
      console.log("sendCloseScreenStream");
      const roomId = rootState.room.room.id;
      console.log(state.socket, "socket");
      state.socket.emit("user-screen-share-disconnected", roomId);
    },
    closeCamStream({ state }: any, userId: string) {
      document.getElementById(userId + CAM_TYPE)?.remove();
      state.peers[userId + CAM_TYPE]?.close();

      // Useful ?
      // document.getElementById("name-" + userId)?.remove();
      // document.getElementById("img-" + userId)?.remove();
    },
    closeScreenStream({ state }: any, userId: string) {
      console.log("closeScreenStream");

      document.getElementById(userId + SCREEN_TYPE)?.remove();
      state.peers[userId + SCREEN_TYPE]?.close();
    },
    createRoom({ state, dispatch }: any) {
      console.log("socket/createRoom 🎃");
      state.socket.emit(
        "vue-create",
        ({ success, err, roomId }: SocketCallback) => {
          handleSocketResult(success, err);
          router.push({ name: "Room", params: { roomId } });
          dispatch("room/createRoom", roomId, { root: true });
        }
      );
    },
    join({ state, dispatch }: any, joinedStreamType: string) {
      console.log("socket/join 🎃", joinedStreamType);
      // TODO Move this in a service, an action should trigger a mutation
      return state.socket.emit(
        "vue-join",
        router.currentRoute.value.params.id,
        joinedStreamType,
        ({ success, err, roomId }: SocketCallback) => {
          handleSocketResult(success, err);
          dispatch("room/createRoom", roomId, { root: true });
        }
      );
    },
    hangUp({ state }: any) {
      console.log("hangUp socket store");

      return state.socket.emit(
        "force-disconnect",
        ({ success, err }: SocketCallback) => handleSocketResult(success, err)
      );
    },
  },
  getters: {
    getSocket(state: SocketState) {
      return state.socket;
    },
    getCamStream(_: any, __: any, rootState: any) {
      return rootState.rtcCam.stream;
    },
    getScreenStream(_: any, __: any, rootState: any) {
      return rootState.rtcScreen.stream;
    },
    getCamPeers(_: any, __: any, rootState: any) {
      return rootState.rtcCam.peers;
    },
    getScreenPeers(_: any, __: any, rootState: any) {
      return rootState.rtcScreen.peers;
    },
  },
};
