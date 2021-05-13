<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
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
