<template>
  This is a room 😎
  <div id="video-grid">
    <video id="user-video" ref="camVideo" :src-object="srcObject">Test</video>
  </div>
  <button class="btn btn-success mb-2" @click="startCamVideo">
    Connect My Camera
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
import { ref, defineComponent, reactive, toRefs } from "vue";
import { useStore } from "vuex";

interface CamVideoRef {
  srcObject: MediaStream;
  muted: boolean;
  onloadedmetadata: (e: any) => void;
  play: () => void;
}

export default defineComponent({
  name: "Room",
  components: {},
  setup() {
    const camVideo = ref<null | CamVideoRef>(null);
    const store: any = useStore();
    const state = reactive({
      srcObject: {
        type: MediaStream,
        required: false,
      },
    });

    const startCamVideo = () => store.dispatch("rtcp/startCamVideo");

    store.watch(
      () => store.getters["rtcp/getCam"],
      (stream: MediaStream) => {
        const videoHTML = camVideo.value;
        if (stream && videoHTML) {
          videoHTML.srcObject = stream;
          videoHTML.muted = true;
          videoHTML.onloadedmetadata = (e) => e.target.play();
        }
      }
    );

    return {
      camVideo,
      startCamVideo,
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
</style>
