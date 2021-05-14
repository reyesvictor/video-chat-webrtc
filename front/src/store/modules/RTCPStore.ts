interface IceServer {
  urls: string;
}

interface RTCPState {
  peers: Peer;
  iceServers: IceServer[];
  user: {
    media: MyMedia;
    streams: {
      cam: MediaStream;
      screen: MediaStream;
    };
  };
}

interface Peer {
  [key: string]: RTCPeerConnection;
}

// @ts-ignore
navigator.getUserMedia =
  navigator.getUserMedia ||
  // @ts-ignore
  navigator.webkitGetUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia ||
  // @ts-ignore
  navigator.msGetUserMedia;

import { getCamStream, getScreenStream } from "@/services/StreamService";
import { toast } from "@/services/ToastService";
import { MyMedia, MyMediaStream } from "@/types";

export default {
  namespaced: true,
  state: {
    peers: {
      type: {} as Peer,
      required: false,
    },
    iceServers: {
      type: {} as IceServer[],
      default: [
        {
          urls: "stun:stun.services.mozilla.com",
        },
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    },
    user: {
      media: {
        audio: true, // set to true for the others
        video: {
          width: 300,
          height: 300,
        },
      },
      streams: {
        cam: {
          type: MediaStream,
          required: false,
        },
        screen: {
          type: MediaStream,
          required: false,
        },
      },
    },
  },
  mutations: {
    START_CAM_VIDEO(state: RTCPState, stream: MediaStream) {
      state.user.streams.cam = stream;
    },
    START_SCREEN_VIDEO(state: RTCPState, stream: MediaStream) {
      state.user.streams.screen = stream;
    },
  },
  actions: {
    async startCamVideo({ state, commit }: any) {
      const stream: MyMediaStream = await getCamStream(state.user.media);
      if (stream) commit("START_CAM_VIDEO", stream);
    },
    async startScreenVideo({ commit }: any) {
      // should I get the stream before and then only send the stream payload to the action ?
      // or create another module specific for streams
      const stream: MyMediaStream = await getScreenStream();
      if (stream) commit("START_SCREEN_VIDEO", stream);
    },
    async hideVideo({ dispatch }: any) {
      const response = await dispatch("updateVideoStatus", false);
      // state.socket.emit("hideVideo", getters.getRoomId);

      return response;
    },
    async showVideo({ dispatch }: any) {
      const response = await dispatch("updateVideoStatus", true);
      // socket.emit('showVideo', roomName);

      return response;
    },
    updateVideoStatus({ getters }: any, bool: boolean): boolean {
      let hasModified = false;
      Object.keys(getters.getCleanPeers).forEach((id) => {
        const senders = getters.getCleanPeers[id].getSenders();
        senders.forEach((sender: RTCRtpSender) => {
          if (sender.track?.kind === "video") {
            sender.track.enabled = bool;
            hasModified = true;
          }
        });
      });

      return hasModified;
    },
    async muteAudio({ dispatch }: any) {
      const response = await dispatch("updateAudioStatus", false);
      // state.socket.emit("hideVideo", getters.getRoomId);

      return response;
    },
    async enableAudio({ dispatch }: any) {
      const response = await dispatch("updateAudioStatus", true);
      // socket.emit('showVideo', roomName);

      return response;
    },
    updateAudioStatus({ getters }: any, bool: boolean): boolean {
      let hasModified = false;
      Object.keys(getters.getCleanPeers).forEach((id) => {
        const senders = getters.getCleanPeers[id].getSenders();
        senders.forEach((sender: RTCRtpSender) => {
          if (sender.track?.kind === "audio") {
            sender.track.enabled = bool;
            hasModified = true;
          }
        });
      });

      return hasModified;
    },
    hangUp({ getters }: any) {
      try {
        console.log("hangUp");

        const cam = getters.getCam;
        cam.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        console.log("hangUp2");
      } catch (err) {
        toast("error", err);
      }
    },
  },
  getters: {
    getCam(state: RTCPState): MediaStream {
      return state.user.streams.cam;
    },
    getScreen(state: RTCPState): MediaStream {
      return state.user.streams.screen;
    },
    getPeers(state: RTCPState): Peer {
      return state.peers;
    },
    getRoomId(_: any, _1: any, rootState: any): string {
      return rootState.room.id;
    },
    getCleanPeers(state: RTCPState) {
      const { required, type, ...rest } = state.peers;

      return rest;
    },
  },
};
