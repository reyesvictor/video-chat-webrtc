import { createStore } from "vuex";
import room from "./modules/room";
import rtcp from "./modules/rtpc";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    room,
    rtcp,
  },
});
