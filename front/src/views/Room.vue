<template>
  This is a room 😎
  <div id="video-grid">
    <video id="user-video" :src-object="srcObject"></video>
  </div>
  <button class="btn btn-success mb-2" @click="startVideo">
    Connect Video
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
import { defineComponent, reactive, toRefs } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "Room",
  components: {},
  setup() {
    const store = useStore();
    const state = reactive({
      srcObject: {
        type: MediaStream,
        required: false,
      },
    });

    const startVideo = (): void => {
      console.log("startVideo");
      const res = store.dispatch("rtcp/startVideo");

      console.log("Room.vue startVideo", res);
    };

    return {
      startVideo,
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
