<template>
  This is a room 😎
  <button @click="join" v-if="!hasJoined">Join the Call</button>
  <br />
  <a :href="'/r/' + $route.params.id" target="_blank">Share !</a>
  <div id="audio-grid"></div>
  <div id="video-grid">
    <video id="user-video" ref="camVideo"></video>
    <video id="screen-video" ref="screenVideo"></video>
  </div>
  <div id="buttons-container">
    <button v-if="isCamOn" class="btn btn-secondary mb-2" @click="hideCamVideo">
      🙈"Hide" My Camera
    </button>
    <button v-else class="btn btn-primary mb-2" @click="startCamVideo">
      👁 Show My Camera
    </button>
    <br />
    <button
      v-if="isScreenOn"
      class="btn btn-secondary mb-2"
      @click="stopScreenVideo"
    >
      Stop sharing My Screen
    </button>
    <button v-else class="btn btn-success mb-2" @click="startScreenVideo">
      Share My Screen
    </button>
    <br />
    <button
      type="button"
      class="btn btn-warning"
      id="stopAudio"
      v-if="isAudioOn"
      @click="stopAudio"
    >
      stopAudio 🔇
    </button>
    <button
      type="button"
      class="btn btn-warning"
      id="startAudio"
      v-else
      @click="startAudio"
    >
      startAudio 🔊
    </button>
    <br />
    <button type="button" class="btn btn-danger mt-2" @click="hangUp">
      Hang Up ☎
    </button>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  reactive,
  toRefs,
  onUpdated,
  onBeforeMount,
  computed,
} from "vue";
import { useStore } from "vuex";
import router from "../../src/router/index";
import { CAM_TYPE, handleCatch, SCREEN_TYPE } from "../store/modules/utils";
import { toggleFullscreen } from "../services/StreamService";

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
    //WHERE TO PUT THIS ? VUE VERSION?
    onUpdated(() => {
      document.querySelectorAll("video").forEach((video) => {
        video.onclick = () => toggleFullscreen("#" + video.getAttribute("id"));
      });
    });

    const camVideo = ref<null | VideoHTMLRef>(null);
    const screenVideo = ref<null | VideoHTMLRef>(null);
    const store: any = useStore();

    const state = reactive({
      srcObject: {
        type: MediaStream,
        required: false,
      },
      isScreenOn: computed(() => store.getters["rtcScreen/getIsVideoActive"]),
      isCamOn: computed(() => store.getters["rtcCam/getIsVideoActive"]),
      isAudioOn: computed(() => store.getters["rtcCam/getIsAudioActive"]),
      hasJoined: false,
    });

    // SCREEN VIDEO
    const startScreenVideo = () => store.dispatch("rtcScreen/startVideo");
    const stopScreenVideo = () => store.dispatch("rtcScreen/stopVideo");

    // CAM VIDEO
    const startCamVideo = () => store.dispatch("rtcCam/startVideo"); // same as showVideo
    const hideCamVideo = () => store.dispatch("rtcCam/hideVideo");
    const startAudio = () => store.dispatch("rtcCam/startAudio");
    const stopAudio = () => store.dispatch("rtcCam/stopAudio");

    const hangUp = async () => {
      store.dispatch("rtcCam/hangUp");
      const success = await store.dispatch("socket/hangUp");
      if (success) router.push({ name: "Home" });
    };

    store.watch(
      () => store.getters["rtcCam/getStream"],
      (stream: MediaStream) => {
        const videoHTML = camVideo.value;
        if (stream && videoHTML) {
          try {
            videoHTML.srcObject = store.getters["rtcCam/getStream"];
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
          } catch (err: any) {
            handleCatch(err);
          }
        }
        // if inactive, show image...
      }
    );

    store.watch(
      () => store.getters["rtcScreen/getStream"],
      (stream: MediaStream) => {
        const videoHTML = screenVideo.value;
        console.log("watcher", stream, videoHTML);
        if (stream && videoHTML) {
          try {
            videoHTML.srcObject = stream;
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
            state.isScreenOn = true;
            store.dispatch("socket/join", SCREEN_TYPE, { root: true });
          } catch (err: any) {
            handleCatch(err);
          }
        }
      }
    );

    const join = async () => {
      store.dispatch("rtcCam/setEmptyStream");

      // ONLY IF SOMEONES JOINS AND DOESNT CREATE A ROOM !!
      store.dispatch("socket/connect"); // WARNING DOUBLE CONNECT IF THE SAME PERSON CREATED THE
      const success = await store.dispatch("socket/join", CAM_TYPE);

      // TODO movie hasJoined inside a STORE like SOCKETSTORE
      console.log("BRUH BRUH", success);
      if (success) state.hasJoined = true;
    };

    onBeforeMount(() => {
      console.log("onBeforeMount join 🎄");
      join();
    });

    return {
      join,
      hangUp,
      camVideo,
      hideCamVideo,
      stopAudio,
      startAudio,
      screenVideo,
      startCamVideo,
      stopScreenVideo,
      startScreenVideo,
      toggleFullscreen,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
#video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 533px);
  grid-auto-rows: 300px;
}

video,
img {
  width: 533px;
  height: 300px;
  // max-width: -webkit-fill-available !important;
  // max-width: -webkit-fill-available !important;
  max-height: 300px !important;
  max-width: 533px !important;
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
