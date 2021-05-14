import st from "../../services/swalToast";
import axios from "axios";
import router from "@/router";

interface Peer {
  id: number;
}

interface IceServer {
  urls: string;
}

interface RTCPState {
  peers: Peer[];
  iceServers: IceServer[];
  user: {
    media: MyMedia;
    streams: {
      cam: MediaStream;
      screen: MediaStream;
    };
  };
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

import { getCamStream, getScreenStream } from "@/services/streams";
import { MyMedia, MyMediaStream } from "@/types";

export default {
  namespaced: true,
  state: {
    peers: {
      type: {} as Peer[],
      default: {},
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
        audio: false, // set to true for the others
        video: {
          width: 176,
          height: 144,
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
  },
  getters: {
    getCam(state: RTCPState): MediaStream {
      return state.user.streams.cam;
    },
    getScreen(state: RTCPState): MediaStream {
      return state.user.streams.screen;
    },
  },
};
