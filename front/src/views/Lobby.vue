<template>
  This is THE LOBBY 😎

  <button @click="join">Join</button>
  <br />
  <a :href="'/join/' + $route.params.id" target="_blank">Share !</a>
  <div id="video-grid">
    <video id="user-video" ref="camVideo" muted></video>
    <video id="screen-video" ref="screenVideo"></video>
  </div>
  <button v-if="!isCamOn" class="btn btn-success mb-2" @click="startCamVideo">
    Show My Camera
  </button>
  <button v-else class="btn btn-success mb-2" @click="startCamVideo">
    Hide My Camera
  </button>
  <button
    v-if="!isScreenOn"
    class="btn btn-success mb-2"
    @click="startScreenVideo"
  >
    Share My Screen
  </button>
  <button v-else class="btn btn-success mb-2" @click="startScreenVideo">
    Hide My Screen
  </button>
  <br />
  <input type="text" value="Random" id="newNameInput" />
  <button type="button" id="newNameButton">Submit new name 🏷</button>
  <br />
  <button type="button">Hide Video 📹</button>
  <button type="button">Show Video 📽</button>
  <br />
  <button type="button">muteAudio 🔇</button>
  <button type="button">enableAudio 🔊</button>
  <br />
  <button type="button" class="btn btn-danger">Hang Up ☎</button>
  <br />
</template>

<script lang="ts">
import { toast } from "../services/ToastService";
import { ref, defineComponent, reactive, toRefs } from "vue";
import { useStore } from "vuex";
import { CAM_TYPE, handleCatch, SCREEN_TYPE } from "../store/modules/utils";

interface VideoHTMLRef {
  srcObject: MediaStream;
  muted: boolean;
  onloadedmetadata: (e: any) => void;
  play: () => void;
}

export default defineComponent({
  name: "Lobby",
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
      isScreenOn: false,
    });

    // TODO factorize this function with the same inside ROOM.vue
    const join = () => {
      store.dispatch("socket/connect");
      // TODO setup up empty video when joining room
      // store.dispatch("rtcCam/setEmptyStream");
      // store.dispatch("rtcScreen/setEmptyStream");
      console.log("Lobby.vue -> join() ", CAM_TYPE);
      // store.dispatch("socket/join", CAM_TYPE);
    };

    const startCamVideo = () => store.dispatch("rtcCam/startVideo");
    const startScreenVideo = () => store.dispatch("rtcScreen/startVideo");

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
            store.dispatch("socket/join", SCREEN_TYPE, { root: true });
          } catch (err: any) {
            handleCatch(err);
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
          } catch (err: any) {
            handleCatch(err);
          }
        }
      }
    );

    return {
      join,
      camVideo,
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
  width: 533px;
  height: 300px;
  object-fit: cover;
}

#user-video {
  background: red;
}

#screen-video {
  background: green;
}
</style>
