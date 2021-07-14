import store from "@/store";
import { handleCatch } from "@/store/modules/utils";

const log = (...values: any) => console.log("🎏 MediaSteamService ", ...values);

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst: any = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];

  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = () => {
  const { width, height } = store.getters["rtcCam/getVideoSize"];
  const canvas: any = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

export const getEmptyMediaStream = (): MediaStream =>
  new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack()]);

export const replaceTracks = (senders: RTCRtpSender[], stream: MediaStream) => {
  senders.forEach((sender: RTCRtpSender) => {
    if (!sender.track?.kind) return false;

    const trackKind = sender.track.kind;

    const newTrack = stream
      .getTracks()
      .find((track: MediaStreamTrack) => track.kind === trackKind);

    if (newTrack) {
      log("New %s track set 😎", trackKind);
      sender.track.enabled = true;
      sender.replaceTrack(newTrack).catch(handleCatch);
    } else {
      log("New %s track disabled 😞", trackKind);
      sender.track.enabled = false;
    }
  });
};
