import st from "../../services/swalToast";
import axios from "axios";
import router from "@/router";

interface Peer {
  id: number;
}

interface IceServer {
  urls: string;
}

interface Media {
  audio: boolean;
  video: {
    width: number;
    height: number;
  };
}

interface State {
  peers: Peer[];
  iceServers: IceServer[];
  user: {
    media: Media;
    stream: MediaStream;
    // video
    // stream
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
        type: {} as Media,
        default: {
          audio: false, // set to true for the others
          video: {
            width: 176,
            height: 144,
          },
        },
      },
      video: {},
      stream: {
        type: MediaStream,
        required: false,
      },
    },
  },
  mutations: {
    START_VIDEO(state: State, stream: MediaStream) {
      state.user.stream = stream;
      // set srcObject
      // play()
    },
  },
  actions: {
    async startUserVideo({ state, getters, commit }: any) {
     
    },
    async startScreenVideo({ state, getters, commit }: any) {
      // should I get the stream before and then only send the stream payload to the action ?
      console.log("startVideo in store");
      const stream = getters.getScreenStream();

      if (!stream) return false;

      commit("START_VIDEO", stream);
      return true;
    },
  },
  getters: {
    async getUserStream(state: State): Promise<MediaStream | boolean> {
      
    },
    async getScreenStream(state: State): Promise<MediaStream | boolean> {
      let stream;
      if (navigator.mediaDevices) {
        try {
          // @ts-ignore
          stream = await navigator.mediaDevices.getDisplayMedia();
        } catch (err) {
          st("error", err);
          return false;
        }
      } else {
        try {
          // @ts-ignore
          stream = await navigator.getUserMedia(state.user.media);
        } catch (err) {
          st("error", err);
          return false;
        }
      }

      console.log("getStream", stream);
      return stream;
    },
  },
};
