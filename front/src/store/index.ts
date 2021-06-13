import { createStore } from "vuex";
import room from "./modules/RoomStore";
import rtcCam from "./modules/RTCCamStore";

// test using same vuex file for 2 same stores
// import rtcCam from "./modules/RTCScreenStore";
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
