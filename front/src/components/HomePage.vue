<template>
  <div>
    <h3>Welcome to Boom</h3>
    <p>Create a new room for your meetings</p>
    <button class="btn btn-success" @click="createRoom">Let's start !</button>
    <hr />
    <p>
      To join a room, ask someone inside the room to share the link to you 😃
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

// TODO See if the logic should be in the /views instead of /components
export default defineComponent({
  name: "HomePage",
  props: {
    msg: String,
  },
  setup() {
    const store = useStore();

    const createRoom = (): void => {
      console.log("createRoom");
      store.dispatch("socket/connect");
      store.dispatch("socket/createRoom");
    };

    return {
      createRoom,
    };
  },
});
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
