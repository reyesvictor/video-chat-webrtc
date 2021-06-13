import { toast } from "../../services/ToastService";
import { RTCState } from "./types";

interface UserState {
  cam_rtc: RTCState;
  screen_rtc: RTCState;
}

export default {
  namespaced: true,
  state: {
    cam_rtc: {
      type: {} as RTCState,
    },
    screen_rtc: {
      type: {} as RTCState,
    },
  },
  mutations: {
    ADD_CAM_STREAM(state: UserState, payload: string) {
      // state.room.id = payload;
    },
  },
  actions: {
    // createRoom({ commit, dispatch }: any) {
    //   axios
    //     .get("http://localhost:4000/generate-room")
    //     .then((response) => {
    //       console.log(response);
    //       const id = response.data;
    //       commit("CREATE_ROOM", id);
    //       router.push({ name: "Room", params: { id } });
    //       // connect to socket
    //       dispatch("socket/connect", null, { root: true });
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //       toast("error", "Error occurred inside API");
    //     });
    // },
  },
  getters: {},
};
