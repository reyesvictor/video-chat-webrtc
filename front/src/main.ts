import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import LogRocket from "logrocket";

LogRocket.init("v19f2f/vue3");
createApp(App).use(store).use(router).mount("#app");
