import { CAM_TYPE, SCREEN_TYPE, STREAMS_TYPE } from "./utils";
import { getScreenStream } from "@/services/StreamService";
import { toast } from "../../services/ToastService";
import io, { Socket } from "socket.io-client";
import router from "@/router/index";
import {
  OnIceCandidateFunction,
  OnTrackFunction,
} from "../../services/RTCService";
import { IceServer, StreamCommunication } from "./types";
import { stringifyQuery } from "vue-router";

const myIO: any = io;

interface SocketState {
  socket: Socket;
}

interface SocketCallback {
  id: string;
  err: string;
  success: string;
}

const iceServers: IceServer[] = [
  {
    urls: "stun:stun.services.mozilla.com",
  },
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

const configuration: RTCConfiguration = { iceServers };

export default {
  namespaced: true,
  state: {
    socket: {
      type: Socket,
      required: false,
    },
  },
  mutations: {
    CONNECT(state: SocketState) {
      state.socket = myIO.connect(
        // local test
        "http://localhost:4000" ??
          "http://" + window.location.hostname + ":4000"
      );
    },
  },
  actions: {
    connect({ state, commit, getters, rootState }: any) {
      commit("CONNECT");

      console.log("connect 🎃");

      const socket = state.socket;

      const camPeers = getters.getCamPeers;
      const screenPeers = getters.getScreenPeers;
      const cam = getters.getCamStream;
      const screen = getters.getScreenStream;

      // TODO trigger this ready when adding screen share inside conversation
      socket.on("ready", (userId: string, joinedStreamType: string) => {
        const cam = getters.getCamStream;

        console.log("ready");

        console.log("before cam", cam);

        // TODO this is triggered again when I start screen share after...
        if (rootState.rtcCam.workflow.video.STARTED) {
          console.log("ready rtcCam");
          // generating offer

          camPeers[userId + joinedStreamType] = new RTCPeerConnection(
            configuration
          );
          const camPeer = camPeers[userId + joinedStreamType];

          const streamCommunication = {
            joined: joinedStreamType,
            present: CAM_TYPE,
          };

          camPeer.onicecandidate = (e: any) =>
            OnIceCandidateFunction(e, userId, state, streamCommunication);
          camPeer.ontrack = (e: any) =>
            OnTrackFunction(e, userId, joinedStreamType);

          // if (joinedStreamType === CAM_TYPE) {
          cam.getTracks().forEach((track: MediaStreamTrack) => {
            camPeer.addTrack(track, cam);
          });
          // }

          camPeer
            .createOffer()
            .then((offer: any) => {
              camPeer
                .setLocalDescription(new RTCSessionDescription(offer))
                .then(async () => {
                  state.socket.emit(
                    "offer",
                    offer,
                    userId,
                    streamCommunication
                  ); // reply only to user that joined
                })
                .catch((err: Error) => console.log(err));
            })
            .catch((err: Error) => console.log(err));
        }

        // generating screen offer
        if (
          rootState.rtcScreen.workflow.video.STARTED &&
          joinedStreamType === CAM_TYPE
        ) {
          console.log("ready rtcScreen");
          screenPeers[userId + joinedStreamType] = new RTCPeerConnection(
            configuration
          );
          const screenPeer = screenPeers[userId + joinedStreamType];

          const streamCommunication = {
            joined: joinedStreamType,
            present: SCREEN_TYPE,
          };
          screenPeer.onicecandidate = (e: any) =>
            OnIceCandidateFunction(e, userId, state, streamCommunication);
          // screenPeer.ontrack = (e: any) =>
          //   OnTrackFunction(e, userId, joinedStreamType);

          screen.getTracks().forEach((track: MediaStreamTrack) => {
            screenPeer.addTrack(track, screen); // type : MediaStreamTrack
          });

          screenPeer
            .createOffer()
            .then((offer: any) => {
              screenPeer
                .setLocalDescription(new RTCSessionDescription(offer))
                .then(async () => {
                  state.socket.emit(
                    "offer",
                    offer,
                    userId,
                    streamCommunication
                  ); // reply only to user ready
                })
                .catch((err: Error) => console.log(err));
            })
            .catch((err: Error) => console.log(err));
        }
      });

      // put this in types file
      interface MyRTCOffer extends RTCSessionDescription {
        streamType?: string;
      }

      // TODO rename offer to rtc session description... ==> not clear my dude its wednesday
      socket.on(
        "offer",
        (
          offer: MyRTCOffer,
          userId: string,
          streamCommunication: StreamCommunication
        ) => {
          console.log("offer");

          // Cam
          if (
            rootState.rtcCam.workflow.video.STARTED &&
            streamCommunication.joined === CAM_TYPE
          ) {
            console.log("offer rtcCam inside");

            // TODO move all this code camPeers[] and screenPeers[] inside their respective actions and mutations
            camPeers[userId + streamCommunication.present] =
              new RTCPeerConnection(configuration);
            const camPeer = camPeers[userId + streamCommunication.present];
            camPeer.onicecandidate = (e: any) =>
              OnIceCandidateFunction(e, userId, state, streamCommunication);

            camPeer.ontrack = (e: any) =>
              OnTrackFunction(e, userId, streamCommunication.joined);

            cam.getTracks().forEach((track: MediaStreamTrack) => {
              camPeer.addTrack(track, cam);
            });
            camPeer
              .setRemoteDescription(new RTCSessionDescription(offer))
              .then(async () => {
                camPeer
                  .createAnswer()
                  .then((answer: RTCSessionDescription) => {
                    // verify if type is correct
                    camPeer.setLocalDescription(answer).catch((err: string) => {
                      console.log(err);
                      toast("error", err);
                    });

                    state.socket.emit(
                      "answer",
                      answer,
                      userId,
                      streamCommunication
                    ); // only send answer to specific user
                  })
                  .catch((err: string) => {
                    console.log(err);
                    toast("error", err);
                  });
              })
              .catch((err: string) => {
                console.log(err);
                toast("error", err);
              });
          }

          // Screen
          if (
            rootState.rtcScreen.workflow.video.STARTED &&
            streamCommunication.joined === SCREEN_TYPE
          ) {
            console.log("offer rtcScreen inside");

            screenPeers[userId + streamCommunication.present] =
              new RTCPeerConnection(configuration);
            const screenPeer =
              screenPeers[userId + streamCommunication.present];
            screenPeer.onicecandidate = (e: any) =>
              OnIceCandidateFunction(e, userId, state, streamCommunication);
            // screenPeer.ontrack = (e: any) =>
            //   OnTrackFunction(e, userId, streamCommunication.joined);

            const screen = getters.getScreenStream;

            console.log(screen);

            screen.getTracks().forEach((track: MediaStreamTrack) => {
              console.log("screen offer track ", track);
              screenPeer.addTrack(track, screen);
            });

            screenPeer
              .setRemoteDescription(new RTCSessionDescription(offer))
              .then(async () => {
                screenPeer
                  .createAnswer()
                  .then((answer: RTCSessionDescription) => {
                    // verify if type is correct
                    screenPeer
                      .setLocalDescription(answer)
                      .catch((err: string) => {
                        console.log(err);
                        toast("error", err);
                      });

                    state.socket.emit(
                      "answer",
                      answer,
                      userId, // TODO shouldnt be userId + .joined ?
                      streamCommunication
                    ); // only send answer to specific user
                  })
                  .catch((err: string) => {
                    console.log(err);
                    toast("error", err);
                  });
              })
              .catch((err: string) => {
                console.log(err);
                toast("error", err);
              });
          }
        }
      );

      // create socket.on cam-candidate / screen-candidate ? or detect with id ?
      // only need to know the joined stream type
      socket.on(
        "candidate",
        (
          candidate: RTCIceCandidate,
          userId: string,
          streamCommunication: StreamCommunication
        ) => {
          console.log("socket.on candidate: ", streamCommunication);

          // here streamType is not the good one, i should verify the user that is stream that needs to setup the icecandidate (=== the one who joined the stream)
          console.log("camPeers", Object.keys(camPeers));
          console.log(
            "screenPeers",
            userId,
            Object.keys(screenPeers),
            userId + streamCommunication.present in screenPeers
          );

          if (streamCommunication.present === CAM_TYPE) {
            // console.log(Object.keys(camPeers));

            if (userId + streamCommunication.joined in camPeers) {
              camPeers[userId + streamCommunication.joined]
                .addIceCandidate(candidate)
                .catch((err: string) => {
                  console.log(err);
                  toast("error", err);
                });
            } else if (userId + streamCommunication.present in camPeers) {
              camPeers[userId + streamCommunication.present]
                .addIceCandidate(candidate)
                .catch((err: string) => {
                  console.log(err);
                  toast("error", err);
                });
            }
          } else if (streamCommunication.present === SCREEN_TYPE) {
            // console.log(Object.keys(screenPeers));
            console.log(
              "userId + streamCommunication.present in screenPeers 😭😭😭😭😭"
            );

            screenPeers[userId + streamCommunication.present]
              .addIceCandidate(candidate)
              .catch((err: string) => {
                console.log(err);
                toast("error", err);
              });
          }
        }
      );

      // BUG quand premier est en camera et que le deuxieme join en screen

      // needs to know the already present stream type
      socket.on(
        "answer",
        (
          answer: RTCSessionDescription,
          userId: string,
          streamCommunication: StreamCommunication
        ) => {
          console.log("answer info ", streamCommunication);

          if (streamCommunication.present === CAM_TYPE) {
            camPeers[userId + streamCommunication.joined]
              .setRemoteDescription(new RTCSessionDescription(answer))
              .catch((err: string) => {
                console.log(err);
                toast("error", err);
              });
          } else if (streamCommunication.present === SCREEN_TYPE) {
            screenPeers[userId + streamCommunication.joined]
              .setRemoteDescription(new RTCSessionDescription(answer))
              .catch((err: string) => {
                console.log(err);
                toast("error", err);
              });
          }
        }
      );

      // correct this to stream-disconnected
      socket.on("user-disconnected", (userId: string) => {
        document.getElementById(userId)?.remove();

        const name = document.getElementById("name-" + userId);
        if (name) name.remove();

        const img = document.getElementById("img-" + userId);
        if (img) img.remove();

        state.peers[userId].close();
      });
    },
    create({ state }: any) {
      console.log("create 🎃");
      state.socket.emit(
        "vue-create",
        ({ success, err, id }: SocketCallback) => {
          if (err) {
            toast("error", err);
          } else {
            toast("success", success);
            router.push({ name: "Room", params: { id } });

            // do more code
            // to begin lets assume every user will activate his webcam
          }
        }
      );
    },
    join({ state, dispatch }: any, joinedStreamType: string) {
      // here problem, we connect once and trigger one ready so the other users send only nbut if we have two streams,
      // so we get both streams of every user to get only to the cam user ,
      // do we really care to whom it goes ? because we only need to show them...
      // mhmhmhmhmhmhmhmhmhmhmhmhmhmhm
      // only send all to cams...
      // screens => only setlocaldescription

      // what i need to do: when user joins, create a default cam stream event without a video / audio stream,
      // and just replace it with the real cam when activated

      // TODO supprimer cette fonction car elle a rien à faire dans rtcScreenStore ?
      console.log("socket/join ", joinedStreamType);

      // goal: a user can and see cams of others without having one !!!!!!!!!!

      // TODO Move this in a service
      state.socket.emit(
        "vue-join",
        router.currentRoute.value.params.id,
        joinedStreamType,
        ({ success, err }: SocketCallback) => {
          if (err) {
            toast("error", err);
            return false;
          } else {
            toast("success", success);
            return true;
          }
        }
      );
    },
    hangUp({ state }: any) {
      console.log("hangUp socket store");

      return state.socket.emit(
        "force-disconnect",
        ({ success, err }: SocketCallback) => {
          if (err) {
            toast("error", err);
            return false;
          } else {
            toast("success", success);
            return true;
          }
        }
      );
    },
  },
  getters: {
    getSocket(state: SocketState) {
      return state.socket;
    },
    getCamStream(_: any, __: any, rootState: any) {
      return rootState.rtcCam.stream;
    },
    getScreenStream(_: any, __: any, rootState: any) {
      return rootState.rtcScreen.stream;
    },
    getCamPeers(_: any, __: any, rootState: any) {
      return rootState.rtcCam.peers;
    },
    getScreenPeers(_: any, __: any, rootState: any) {
      return rootState.rtcScreen.peers;
    },
  },
};
