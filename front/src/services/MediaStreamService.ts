import { handleCatch } from "@/store/modules/utils";

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst: any = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
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
  new MediaStream([
    createEmptyAudioTrack(),
    createEmptyVideoTrack({ width: 640, height: 480 }),
  ]);

export const replaceTracks = (senders: RTCRtpSender[], stream: MediaStream) => {
  senders.forEach((sender: RTCRtpSender) => {
    if (sender.track?.kind === "video") {
      const newVideoTrack = stream
        .getTracks()
        .find((track: MediaStreamTrack) => track.kind === "video");

      if (newVideoTrack) {
        console.log("New Video track set 😎");
        sender.track.enabled = true;
        sender.replaceTrack(newVideoTrack).catch(handleCatch);
      } else {
        console.log("New Video track disabled 😞");
        sender.track.enabled = false;
      }
    } else if (sender.track?.kind === "audio") {
      const newAudioTrack = stream
        .getTracks()
        .find((track: MediaStreamTrack) => track.kind === "audio");

      if (newAudioTrack) {
        console.log("New Audio track set 😎");
        sender.track.enabled = true;
        sender.replaceTrack(newAudioTrack).catch(handleCatch);
      } else {
        console.log("New Audio track disabled 😞");
        sender.track.enabled = false;
      }
    }
  });
};
