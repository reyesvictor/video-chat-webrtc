<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" /> -->
    <img
      alt="Boom logo"
      src="https://www.pngplay.com/wp-content/uploads/1/Letter-B-PNG-Stock-Photo.png"
      id="logo"
    />
    <HomePage msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HomePage from "../components/HomePage.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {
    HomePage,
  },
});
</script>

<style lang="scss" scoped>
#logo {
  height: 150px;
}
</style>
