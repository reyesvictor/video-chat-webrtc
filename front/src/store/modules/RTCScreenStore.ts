import { CAM_TYPE, handleCatch, SCREEN_TYPE } from "./utils";
import { getScreenStream } from "@/services/StreamService";
import { toast } from "@/services/ToastService";
import { MyMediaStream } from "@/types";
import { Peer, RTCState, Workflow } from "./types";
import {
  getEmptyMediaStream,
  getIsStreamOn,
} from "@/services/MediaStreamService";

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
    workflow: {
      video: {
        STARTED: false,
        // DISCONNECTED: false,
      },
    },
  },
  mutations: {
    UPDATE_VIDEO(state: RTCState, stream: MediaStream) {
      state.stream = stream;
    },
    UPDATE_WORKFLOW(state: RTCState, workflow: Workflow) {
      state.workflow = workflow;
      console.log("new screen workflow", workflow);
    },
    STOP_VIDEO(state: RTCState) {
      state.workflow.video.STARTED = false;

      // doublon hangUp
      state.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      state.stream = getEmptyMediaStream();

      console.log("peers", state.peers);
    },
  },
  actions: {
    async startVideo({ state, commit, dispatch }: any) {
      console.log("rtcScreen/startVideo");
      const stream: MyMediaStream = await getScreenStream();
      if (stream) {
        console.log(stream, "-------------------------------");
        commit("UPDATE_VIDEO", stream);
        const workflow = state.workflow;
        workflow.video.STARTED = true;
        commit("UPDATE_WORKFLOW", workflow);

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
    updateWorkflow({ commit }: any, workflow: Workflow) {
      if (workflow) commit("UPDATE_WORKFLOW", workflow);
    },
    setEmptyStream({ commit }: any) {
      commit("UPDATE_VIDEO", new MediaStream());
    },
  },
  getters: {
    getIsActive(state: RTCState): boolean {
      // is it useful ???? the workflow state is kind of useless now that I use the stream state.
      return state.workflow.video.STARTED;
    },
    getStream(state: RTCState): MediaStream {
      return state.stream;
    },
    getIsStreamVideoOn(state: RTCState): boolean {
      console.log(
        "🎆🎆🎆🎆rtcScreen/getIsStreamVideoOn",
        getIsStreamOn(state.stream, "video")
      );
      return getIsStreamOn(state.stream, "video");
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
