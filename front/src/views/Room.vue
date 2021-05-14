<template>
  This is a room 😎
  <button @click="join" v-if="!hasJoined">Join the Call</button>
  <br />
  <a :href="'/r/' + $route.params.id" target="_blank">Share !</a>
  <div id="video-grid">
    <video id="user-video" ref="camVideo"></video>
    <video id="screen-video" ref="screenVideo"></video>
  </div>
  <div id="buttons-container">
    <button v-if="!isCamOn" class="btn btn-success mb-2" @click="startCamVideo">
      👁 Let's start my Camera
    </button>
    <button
      v-if="isCamOn && isCamHidden"
      class="btn btn-primary mb-2"
      @click="showVideo"
    >
      👁 Show My Camera
    </button>
    <button
      v-else-if="isCamOn && !isCamHidden"
      class="btn btn-secondary mb-2"
      @click="hideVideo"
    >
      🙈Hide My Camera
    </button>
    <br />
    <button
      v-if="!isScreenOn"
      class="btn btn-success mb-2"
      @click="startScreenVideo"
    >
      Share My Screen
    </button>
    <button v-else class="btn btn-secondary mb-2" @click="startScreenVideo">
      Hide My Screen
    </button>
    <br />
    <!-- <input type="text" value="Random" id="newNameInput" /> -->
    <!-- <button type="button" id="newNameButton">Submit new name 🏷</button> -->
    <!-- <br />
    <br /> -->
    <button
      type="button"
      class="btn btn-warning"
      id="muteAudio"
      v-if="!isAudioMute"
      @click="muteAudio"
    >
      muteAudio 🔇
    </button>
    <button
      type="button"
      class="btn btn-warning"
      id="enableAudio"
      v-else
      @click="enableAudio"
    >
      enableAudio 🔊
    </button>
    <br />
    <button type="button" class="btn btn-danger mt-2" @click="hangUp">
      Hang Up ☎
    </button>
  </div>
</template>

<script lang="ts">
import { toast } from "../services/ToastService";
import { ref, defineComponent, reactive, toRefs } from "vue";
import { useStore } from "vuex";
import router from "../../src/router/index";

interface VideoHTMLRef {
  srcObject: MediaStream;
  muted: boolean;
  onloadedmetadata: (e: any) => void;
  play: () => void;
}

export default defineComponent({
  name: "Room",
  components: {},
  setup() {
    const camVideo = ref<null | VideoHTMLRef>(null);
    const screenVideo = ref<null | VideoHTMLRef>(null);
    const store: any = useStore();
    const state = reactive({
      srcObject: {
        type: MediaStream,
        required: false,
      },
      isCamOn: false,
      isCamHidden: false,
      isScreenOn: false,
      isAudioMute: false,
      hasJoined: false,
    });

    const startCamVideo = () => store.dispatch("rtcp/startCamVideo");
    const startScreenVideo = () => {
      store.dispatch("rtcp/startScreenVideo");
    };

    const hideVideo = async () => {
      const success = await store.dispatch("rtcp/hideVideo");
      if (success) state.isCamHidden = true;
    };

    const showVideo = async () => {
      const success = await store.dispatch("rtcp/showVideo");
      if (success) state.isCamHidden = false;
    };

    const muteAudio = async () => {
      const success = await store.dispatch("rtcp/muteAudio");
      if (success) state.isAudioMute = true;
    };

    const enableAudio = async () => {
      const success = await store.dispatch("rtcp/enableAudio");
      if (success) state.isAudioMute = false;
    };

    const hangUp = async () => {
      store.dispatch("rtcp/hangUp");
      const success = await store.dispatch("socket/hangUp");
      if (success) router.push({ name: "Home" });
    };

    store.watch(
      () => store.getters["rtcp/getCam"],
      (stream: MediaStream) => {
        const videoHTML = camVideo.value;
        if (stream && videoHTML) {
          try {
            videoHTML.srcObject = stream;
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
            state.isCamOn = true;
          } catch (err) {
            toast("error", err);
          }
        }
      }
    );

    store.watch(
      () => store.getters["rtcp/getScreen"],
      (stream: MediaStream) => {
        const videoHTML = screenVideo.value;
        console.log("watcher", stream, videoHTML);
        if (stream && videoHTML) {
          try {
            videoHTML.srcObject = stream;
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
            state.isScreenOn = true;
          } catch (err) {
            toast("error", err);
          }
        }
      }
    );

    const join = async () => {
      store.dispatch("socket/connect"); // WARNING DOUBLE CONNECT IF THE SAME PERSON CREATED THE ROOM

      const success = await store.dispatch("socket/join");
      if (success) state.hasJoined = true;
    };

    return {
      join,
      hangUp,
      camVideo,
      hideVideo,
      showVideo,
      muteAudio,
      enableAudio,
      screenVideo,
      startCamVideo,
      startScreenVideo,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
#video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
}

video,
img {
  width: 300px;
  height: 300px;
  max-width: -webkit-fill-available !important;
  max-height: 300px !important;
  object-fit: cover;
}

#user-video {
  background: red;
}

#screen-video {
  background: green;
}

#buttons-container {
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>
