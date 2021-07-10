import { handleCatch } from "@/store/modules/utils";
import { MyMedia, MyMediaStream } from "@/types";

import { toast } from "./ToastService";

// @ts-ignore
navigator.getUserMedia =
  navigator.getUserMedia ||
  // @ts-ignore
  navigator.webkitGetUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia ||
  // @ts-ignore
  navigator.msGetUserMedia;

export const getCamStream = async (
  media: MyMedia
): Promise<void | MediaStream> => {
  let stream;

  if (navigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await navigator.mediaDevices.getUserMedia(media);
    } catch (err: any) {
      handleCatch(err);
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getUserMedia(media);
    } catch (err: any) {
      handleCatch(err);
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
    } catch (err: any) {
      handleCatch(err);
      return false;
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getDisplayMedia();
    } catch (err: any) {
      handleCatch(err);
      return false;
    }
  }

  return stream;
};
