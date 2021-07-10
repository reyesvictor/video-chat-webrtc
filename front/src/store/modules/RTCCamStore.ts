import { replaceTracks } from "./../../services/RTCService";
import { getCamStream } from "@/services/StreamService";
import { Peer, RTCState, Status } from "./types";
import { handleCatch } from "./utils";
import { getEmptyMediaStream } from "@/services/MediaStreamService";

export default {
  namespaced: true,
  state: {
    // TODO peers see if possible to factorize this in the future for both streams
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
    UPDATE_VIDEO(state: RTCState, stream: MediaStream) {
      state.stream = stream;
    },
    UPDATE_WORKFLOW(state: RTCState, status: Status) {
      state.status = status;
      console.log("new cam status", status);
    },
  },
  actions: {
    async startVideo({ getters, state, commit, dispatch }: any) {
      let response = false;
      console.log("rtcCam/startVideo");

      const stream: void | MediaStream = await getCamStream(state.media);

      console.log("stream typeof: ", typeof stream);

      if (stream) {
        commit("UPDATE_VIDEO", stream);
        const status = state.status;
        status.VIDEO_ACTIVE = true;
        commit("UPDATE_WORKFLOW", status);
        console.log("status: ", state.status.VIDEO_ACTIVE);

        // set cam for the first time
        Object.keys(getters.getCleanPeers).forEach((id) => {
          const senders = getters.getCleanPeers[id].getSenders();
          replaceTracks(senders, stream);
          response = true;
        });

        // TODO set state CONNECTED to verify if connected or not and not relaunch it again
        // dispatch("socket/connect", null, { root: true });
        // dispatch("socket/join", CAM_TYPE, { root: true });

        return response;
      }
    },
    async hideVideo({ state, getters, commit }: any) {
      console.log("rtcCam/hideVideo");
      let response = false;

      try {
        const emptyStream = getEmptyMediaStream();
        commit("UPDATE_VIDEO", emptyStream);

        Object.keys(getters.getCleanPeers).forEach((id) => {
          const senders = getters.getCleanPeers[id].getSenders();
          replaceTracks(senders, emptyStream);
        });

        const status = state.status;
        status.VIDEO_ACTIVE = false;
        commit("UPDATE_WORKFLOW", status);
      } catch (err: any) {
        handleCatch(err);
        response = false;
      }

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

      return response;
    },
    async enableAudio({ dispatch }: any) {
      const response = await dispatch("updateAudioStatus", true);

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

        const stream = getters.getStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        console.log("hangUp2");
      } catch (err) {
        handleCatch((err as Error).message);
      }
    },
    setEmptyStream({ state, commit }: any) {
      console.log("rtcCam/setEmptyStream");

      try {
        commit("UPDATE_VIDEO", getEmptyMediaStream());
        const { status } = state;
        status.CAN_CONNECT = true;
        commit("UPDATE_WORKFLOW", status);
      } catch (err: any) {
        handleCatch(err);
        return false;
      }

      return true;
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
