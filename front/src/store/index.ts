import { createStore } from "vuex";
import room from "./modules/RoomStore";
import rtcp from "./modules/RTCPStore";
import socket from "./modules/SocketStore";

export default createStore({
  modules: {
    room,
    rtcp,
    socket,
  },
});
