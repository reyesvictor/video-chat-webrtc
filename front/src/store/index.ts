import { createStore } from "vuex";
import room from "./modules/RoomStore";
import rtcCam from "./modules/RTCCamStore";
import rtcScreen from "./modules/RTCScreenStore";
import socket from "./modules/SocketStore";

export default createStore({
  modules: {
    room,
    socket,
    rtcCam,
    rtcScreen,
  },
});
