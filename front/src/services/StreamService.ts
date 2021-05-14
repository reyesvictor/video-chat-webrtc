import { MyMedia, MyMediaStream } from "@/types";

import { toast } from "./ToastService";

export const getCamStream = async (media: MyMedia): Promise<MyMediaStream> => {
  let stream;

  if (navigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await navigator.mediaDevices.getUserMedia(media);
    } catch (err) {
      toast("error", err);
      return false;
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getUserMedia(media);
    } catch (err) {
      toast("error", err);
      return false;
    }
  }

  return stream;
};

export const getScreenStream = async (): Promise<boolean | MediaStream> => {
  let stream;
  if (navigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await navigator.mediaDevices.getDisplayMedia();
    } catch (err) {
      toast("error", err);
      return false;
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getDisplayMedia();
    } catch (err) {
      toast("error", err);
      return false;
    }
  }

  return stream;
};
