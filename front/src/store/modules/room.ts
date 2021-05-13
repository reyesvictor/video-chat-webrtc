import st from "../../services/swalToast";
import axios from "axios";
import router from "@/router";
import Room from "@/views/Room.vue";

interface Room {
  id: number;
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
    CREATE_ROOM(state: State) {
      console.log("launch request to API");
      // if API says its ok redirect..
      // if API error show error => toast
      axios
        .get("http://localhost:4000/generate-room")
        .then((response) => {
          console.log(response);
          state.room.id = response.data;
          router.push({ name: "Room", params: { id: response.data } });
        })
        .catch((error) => {
          console.log(error);
          st("error", "Error occurred inside API");
        });
    },
    // JOIN_ROOM
  },
  actions: {
    createRoom({ commit }: any) {
      console.log(typeof commit);
      commit("CREATE_ROOM");
    },
  },
  getters: {},
};
