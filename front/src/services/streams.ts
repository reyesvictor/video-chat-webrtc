import { MyMedia, MyMediaStream } from "@/types";

import st from "./swalToast";

export const getCamStream = async (media: MyMedia): Promise<MyMediaStream> => {
  let stream;

  if (navigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await navigator.mediaDevices.getUserMedia(media);
    } catch (err) {
      st("error", err);
      return false;
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getUserMedia(media);
    } catch (err) {
      st("error", err);
      return false;
    }
  }

  console.log("getStream", stream);
  return stream;
};

export const getScreenStream = async (): Promise<boolean | MediaStream> => {
  let stream;
  if (navigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await navigator.mediaDevices.getDisplayMedia();
    } catch (err) {
      st("error", err);
      return false;
    }
  } else {
    try {
      // @ts-ignore
      stream = await navigator.getDisplayMedia();
    } catch (err) {
      st("error", err);
      return false;
    }
  }

  console.log("getStream", stream);
  return stream;
};
