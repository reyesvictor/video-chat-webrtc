import { getScreenStream } from "./../../services/StreamService";
import { doc, handleCatch } from "./utils";
import { MyMediaStream } from "@/types";
import { Peer, RTCState, Status, VideoSize } from "./types";
import { getEmptyMediaStream } from "@/services/MediaStreamService";

// TODO verify if not in mobile to not trigger this store (getmediadevices lacks on mobile)
export default {
  namespaced: true,
  state: {
    type: "",
    peers: {
      type: {} as Peer,
      required: false,
    },
    media: {
      audio: true,
      video: {
        width: 1920,
        height: 1080,
      },
    },
    stream: {
      type: {} as MediaStream,
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
    UPDATE_STATUS(state: RTCState, status: Status) {
      state.status = status;
      console.log("new screen status", status);
    },
    STOP_VIDEO(state: RTCState) {
      state.status.VIDEO_ACTIVE = false;
      state.status.CAN_CONNECT = false;

      // doublon hangUp
      state.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());

      state.stream = getEmptyMediaStream();

      console.log("peers", state.peers);
    },
  },
  actions: {
    async startVideo({ state, commit }: any) {
      console.log("rtcScreen/startVideo");
      const stream: MyMediaStream = await getScreenStream();
      if (stream) {
        commit("UPDATE_VIDEO", stream);
        const status = state.status;
        status.VIDEO_ACTIVE = true;
        state.status.CAN_CONNECT = true;
        commit("UPDATE_STATUS", status);

        // put inside status => VIDEO_ON
        doc.querySelector("#screen-video").style.display = "block";

        // dispatch("socket/connect", null, { root: true });
        // setTimeout(dispatch("socket/join", SCREEN_TYPE, { root: true }), 3000);
      }
    },
    async stopVideo({ commit, dispatch, getters }: any) {
      commit("STOP_VIDEO");
      dispatch("socket/sendCloseScreenStream", null, { root: true });
      Object.values(getters.getCleanPeers).forEach((rtc: any) =>
        rtc?.close?.()
      );

      // add css effect fade out or something else
      doc.querySelector("#screen-video").style.display = "none";
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

      //doublon rtcCamStore/updateVideoStatus
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
      // is this function useful ??
      try {
        console.log("hangUp");

        const stream = getters.getStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        console.log("hangUp2");
      } catch (err: any) {
        handleCatch((err as Error).message);
      }
    },
    updateStatus({ commit }: any, status: Status) {
      if (status) commit("UPDATE_STATUS", status);
    },
    setEmptyStream({ commit }: any) {
      commit("UPDATE_VIDEO", new MediaStream());
    },
  },
  getters: {
    getIsVideoActive(state: RTCState): boolean {
      return state.status.VIDEO_ACTIVE;
    },
    getStream(state: RTCState): MediaStream {
      return state.stream;
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
