<template>
  This is a room 😎
  <div id="video-grid">
    <video id="user-video" ref="camVideo"></video>
    <video id="screen-video" ref="screenVideo"></video>
  </div>
  <button v-if="!isCamOn" class="btn btn-success mb-2" @click="startCamVideo">
    Show My Camera
  </button>
  <button v-else class="btn btn-success mb-2" @click="startCamVideo">
    Hide My Camera
  </button>
  <button v-if="!isScreenOn" class="btn btn-success mb-2" @click="startScreenVideo">
    Share My Screen
  </button>
    <button v-else class="btn btn-success mb-2" @click="startScreenVideo">
    Hide My Screen
  </button>
  <br />
  <input type="text" value="Random" id="newNameInput" />
  <button type="button" id="newNameButton">Submit new name 🏷</button>
  <br />
  <br />
  <button type="button" id="hangUp">Hang Up ☎</button>
  <br />
  <button type="button" id="hideVideo">Hide Video 📹</button>
  <button type="button" id="showVideo">Show Video 📽</button>
  <br />
  <button type="button" id="muteAudio">muteAudio 🔇</button>
  <button type="button" id="enableAudio">enableAudio 🔊</button>
</template>

<script lang="ts">
import st from "../services/swalToast";
import { ref, defineComponent, reactive, toRefs } from "vue";
import { useStore } from "vuex";

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
      isScreenOn: false,
    });

    const startCamVideo = () => store.dispatch("rtcp/startCamVideo");
    const startScreenVideo = () => store.dispatch("rtcp/startScreenVideo");

    store.watch(
      () => store.getters["rtcp/getCam"],
      (stream: MediaStream) => {
        const videoHTML = camVideo.value;
        if (stream && videoHTML) {
          try{
            videoHTML.srcObject = stream;
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
            state.isCamOn = true;
          }catch(err){
            st('error', err);
          }
        }
      }
    );

    store.watch(
      () => store.getters["rtcp/getScreen"],
      (stream: MediaStream) => {
        const videoHTML = screenVideo.value;
        console.log('watcher', stream, videoHTML)
        if (stream && videoHTML) {
          try{
            videoHTML.srcObject = stream;
            videoHTML.muted = true;
            videoHTML.onloadedmetadata = (e) => e.target.play();
            state.isScreenOn = true;
          }catch(err){
            st('error', err);
          }
        }
      }
    );

    return {
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
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#user-video {
  background: red;
}

#screen-video {
  background: green;
}
</style>
