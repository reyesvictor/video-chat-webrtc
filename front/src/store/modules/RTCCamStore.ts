import router from "@/router";
import { getCamStream } from "@/services/StreamService";
import { toast } from "@/services/ToastService";
import { MyMediaStream } from "@/types";
import { Peer, RTCState, Workflow } from "./types";
import { CAM_TYPE } from "./utils";

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
      console.log("new cam workflow", workflow);
    },
  },
  actions: {
    // it begins here
    async startVideo({ getters, state, commit, dispatch }: any) {
      console.log("rtcCam/startVideo");

      const stream: void | MediaStream = await getCamStream(state.media);

      console.log("stream typeof: ", typeof stream);

      if (stream) {
        commit("UPDATE_VIDEO", stream);
        const workflow = state.workflow;
        workflow.video.STARTED = true;
        commit("UPDATE_WORKFLOW", workflow);
        console.log("workflow: ", state.workflow.video.STARTED);

        // set cam for the first time
        Object.keys(getters.getCleanPeers).forEach((id) => {
          const senders = getters.getCleanPeers[id].getSenders();
          senders.forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === "video") {
              const newVideoTrack = stream
                .getTracks()
                .find((track: MediaStreamTrack) => track.kind === "video");

              if (newVideoTrack) {
                console.log("New video tracks setted 😎");
                sender.replaceTrack(newVideoTrack);
              }
            }
          });
        });

        // TODO set state CONNECTED to verify if connected or not and not relaunch it again
        // dispatch("socket/connect", null, { root: true });
        // dispatch("socket/join", CAM_TYPE, { root: true });
      }
    },
    async hideVideo({ dispatch }: any) {
      const response = await dispatch("updateVideoStatus", false);

      return response;
    },
    async showVideo({ dispatch }: any) {
      const response = await dispatch("updateVideoStatus", true);

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
        toast("error", (err as Error).message);
      }
    },
    updateWorkflow({ commit }: any, workflow: Workflow) {
      if (workflow) commit("UPDATE_WORKFLOW", workflow);
    },
    setEmptyStream({ state, commit }: any) {
      console.log("rtcCam/setEmptyStream");
      commit("UPDATE_VIDEO", new MediaStream());
      const workflow = state.workflow;
      workflow.video.STARTED = true;
      commit("UPDATE_WORKFLOW", workflow);
    },
  },
  getters: {
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
  },
};
