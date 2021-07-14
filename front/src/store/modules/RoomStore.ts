import { RoomState } from "./types";

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
  },
  actions: {
    createRoom({ commit }: any, roomId: string) {
      commit("CREATE_ROOM", roomId);
    },
  },
  getters: {},
};
