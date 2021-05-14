import { toast } from "../../services/ToastService";
import axios from "axios";
import router from "@/router";
import Room from "@/views/Room.vue";

interface Room {
  id: string;
  name: string;
}

interface State {
  room: Room;
}

export default {
  namespaced: true,
  state: {
    room: {
      type: {} as Room,
      required: true,
    },
  },
  mutations: {
    CREATE_ROOM(state: State, payload: string) {
      state.room.id = payload;
    },
    // JOIN_ROOM
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
