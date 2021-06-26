import { RoomState } from "./types";
import { toast } from "../../services/ToastService";
import axios from "axios";
import router from "@/router";

interface State {
  room: RoomState;
}

// is this useful ??/
export default {
  namespaced: true,
  state: {
    room: {
      type: {} as RoomState,
      required: true,
    },
  },
  mutations: {
    CREATE_ROOM(state: State, roomId: string) {
      state.room.id = roomId;
    },
    // JOIN_ROOM
  },
  actions: {
    createRoom({ commit }: any, roomId: string) {
      commit("CREATE_ROOM", roomId);
    },
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
