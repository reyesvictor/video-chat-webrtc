import { getCamStream } from "@/services/StreamService";
import { Peer, RTCState } from "./types";
import { handleCatch } from "./utils";
import {
  getEmptyMediaStream,
  replaceTracks,
} from "@/services/MediaStreamService";

export default {
  namespaced: true,
  state: {
    peers: {
      type: {} as Peer,
      required: false,
    },
    media: {
      audio: true,
      video: {
        width: 533,
        height: 300,
      },
    },
    stream: {
      type: MediaStream,
      required: false,
    },
    status: {
      CAN_CONNECT: false,
      VIDEO_ACTIVE: false,
      AUDIO_ACTIVE: false,
    },
  },
  mutations: {
    UPDATE_STREAM(state: RTCState, stream: MediaStream) {
      state.stream = stream;
    },
    SET_VIDEO_ACTIVE(state: RTCState) {
      state.status.VIDEO_ACTIVE = true;
    },
    SET_VIDEO_INACTIVE(state: RTCState) {
      state.status.VIDEO_ACTIVE = false;
    },
    SET_AUDIO_ACTIVE(state: RTCState) {
      state.status.AUDIO_ACTIVE = true;
    },
    SET_AUDIO_INACTIVE(state: RTCState) {
      state.status.AUDIO_ACTIVE = false;
    },
    SET_CAN_CONNECT_ON(state: RTCState) {
      state.status.CAN_CONNECT = true;
    },
    SET_CAN_CONNECT_OFF(state: RTCState) {
      state.status.CAN_CONNECT = false;
    },
  },
  actions: {
    async startVideo({ state, getters, commit, dispatch }: any) {
      console.log("rtcCam/startVideo");
      dispatch("updateStream", {
        audio: getters.getIsAudioActive,
        video: state.media.video, // send parameters
      });

      commit("SET_VIDEO_ACTIVE");
    },
    async hideVideo({ getters, commit, dispatch }: any) {
      console.log("rtcCam/hideVideo");
      dispatch("updateStream", {
        audio: getters.getIsAudioActive,
        video: false,
      });

      commit("SET_VIDEO_INACTIVE");
    },
    async startAudio({ getters, commit, dispatch }: any) {
      console.log("rtcCam/startAudio");

      dispatch("updateStream", {
        audio: true,
        video: getters.getIsVideoActive,
      });

      commit("SET_AUDIO_ACTIVE");
    },
    async stopAudio({ getters, commit, dispatch }: any) {
      console.log("rtcCam/stopAudio");

      dispatch("updateStream", {
        audio: false,
        video: getters.getIsVideoActive,
      });

      commit("SET_AUDIO_INACTIVE");
    },
    async updateStream({ getters, commit }: any, { audio, video }: any) {
      let response = false;

      try {
        let stream: MediaStream = new MediaStream();

        if (video || audio) {
          stream = await getCamStream({
            audio,
            video,
          });
        } else {
          stream = getEmptyMediaStream();
        }

        commit("UPDATE_STREAM", stream);

        if (stream) {
          Object.keys(getters.getCleanPeers).forEach((id) => {
            const senders = getters.getCleanPeers[id].getSenders();

            // make a state for video and audio like FAKE_STREAM, REAL_STREAM pour ne pas faire sauter la video a chaque fois que je mute / unmute mon son
            replaceTracks(senders, stream);
          });

          response = true;
        }
      } catch (err: any) {
        handleCatch(err);
        response = false;
      }

      return response;
    },
    setEmptyStream({ commit }: any) {
      console.log("rtcCam/setEmptyStream");

      try {
        commit("UPDATE_STREAM", getEmptyMediaStream());
        commit("SET_CAN_CONNECT_ON");
      } catch (err: any) {
        handleCatch(err);
        return false;
      }

      return true;
    },
    hangUp({ getters, commit }: any) {
      try {
        console.log("rtcCam/hangUp");

        const stream = getters.getStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        console.log("hangUp2");
        commit("SET_CAN_CONNECT_OFF");
      } catch (err) {
        handleCatch((err as Error).message);
      }
    },
  },
  getters: {
    getStream(state: RTCState): MediaStream {
      return state.stream;
    },
    getIsVideoActive(state: RTCState): boolean {
      return state.status.VIDEO_ACTIVE;
    },
    getIsAudioActive(state: RTCState): boolean {
      return state.status.AUDIO_ACTIVE;
    },
    getPeers(state: RTCState): Peer {
      return state.peers;
    },
    getRoomId(_: any, _1: any, rootState: any): string {
      return rootState.room.id;
    },
    getCleanPeers(state: RTCState) {
      const { required, type, ...rest } = state.peers;

      return rest;
    },
  },
};
