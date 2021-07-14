import {
  replaceTracks,
  createEmptyVideoTrack,
  getEmptyMediaStream,
} from "./../../services/MediaStreamService";
import { getCamStream } from "@/services/StreamService";
import { Peer, RTCState, VideoSize } from "./types";
import { handleCatch } from "./utils";

const log = (...values: any) => true && console.log("📷 rtcCam/", ...values);

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
    STOP_VIDEO(state: RTCState) {
      state.stream
        .getTracks()
        ?.find((e: MediaStreamTrack) => e.kind === "video")
        ?.stop();
    },
    SET_AUDIO_ACTIVE(state: RTCState) {
      state.status.AUDIO_ACTIVE = true;
    },
    SET_AUDIO_INACTIVE(state: RTCState) {
      state.status.AUDIO_ACTIVE = false;
    },
    STOP_AUDIO(state: RTCState) {
      state.stream
        .getTracks()
        ?.find((e: MediaStreamTrack) => e.kind === "audio")
        ?.stop();
    },
    SET_CAN_CONNECT(state: RTCState) {
      state.status.CAN_CONNECT = true;
    },
    SET_CAN_NOT_CONNECT(state: RTCState) {
      state.status.CAN_CONNECT = false;
    },
  },
  actions: {
    async setEmptyStream({ commit, dispatch }: any) {
      log("setEmptyStream");

      await commit("SET_CAN_CONNECT");
      await dispatch("updateStream", {
        audio: false,
        video: false,
      });
    },
    async startVideo({ state, getters, commit, dispatch }: any) {
      log("startVideo");
      await dispatch("updateStream", {
        audio: getters.getIsAudioActive,
        video: state.media.video, // send parameters
      });

      await commit("SET_VIDEO_ACTIVE");
      await dispatch("updateSendersStream");
    },
    async stopVideo({ getters, commit, dispatch }: any) {
      log("stopVideo");

      await commit("STOP_VIDEO");
      await dispatch("updateStream", {
        audio: getters.getIsAudioActive,
        video: false,
      });
      await commit("SET_VIDEO_INACTIVE");
      await dispatch("updateSendersStream");
    },
    async startAudio({ getters, commit, dispatch }: any) {
      log("startAudio");

      await dispatch("updateStream", {
        audio: true,
        video: getters.getIsVideoActive,
      });

      await commit("SET_AUDIO_ACTIVE");
      await dispatch("updateSendersStream");
    },
    async stopAudio({ getters, commit, dispatch }: any) {
      log("stopAudio");

      await commit("STOP_AUDIO");
      await dispatch("updateStream", {
        audio: false,
        video: getters.getIsVideoActive,
      });
      await commit("SET_AUDIO_INACTIVE");
      await dispatch("updateSendersStream");
    },
    async updateStream({ commit }: any, { audio, video }: any) {
      try {
        let stream: MediaStream = new MediaStream();

        if (video || audio) {
          stream = await getCamStream({
            audio,
            video,
          });

          if (!video) {
            stream.addTrack(createEmptyVideoTrack());
          }
        } else {
          stream = getEmptyMediaStream();
        }

        await commit("UPDATE_STREAM", stream);
      } catch (err: any) {
        handleCatch(err);
      }
    },
    updateSendersStream({ getters }: any) {
      log("updateSendersStream");
      const stream = getters.getStream;
      if (stream) {
        Object.values(getters.getCleanPeers).forEach(
          async (peer: any | RTCPeerConnection) => {
            // make a state for video and audio like FAKE_STREAM, REAL_STREAM pour ne pas faire sauter la video a chaque fois que je mute / unmute mon son
            // const st = await getEmptyMediaStream(getters.getVideoSize);
            replaceTracks(peer.getSenders(), stream);
          }
        );
      }
    },
    hangUp({ getters, commit }: any) {
      try {
        log("hangUp");

        const stream = getters.getStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        commit("SET_CAN_NOT_CONNECT");
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
    getVideoSize(state: RTCState): VideoSize {
      return state.media.video;
    },
  },
};
