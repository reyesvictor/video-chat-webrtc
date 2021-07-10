import { RoomState } from "./types";
import { toast } from "../../services/ToastService";
import axios from "axios";
import router from "@/router";

interface State {
  room: RoomState;
}

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
  },
  getters: {},
};
