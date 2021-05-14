<template>
  This is a room 😎

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

    const join = () => {
      store.dispatch("socket/connect");
      store.dispatch("socket/join");
    };

    const startCamVideo = () => store.dispatch("rtcp/startCamVideo");
    const startScreenVideo = () => store.dispatch("rtcp/startScreenVideo");

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
  width: 300px;
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
