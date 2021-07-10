import { handleCatch } from "@/store/modules/utils";
import { MyMedia } from "@/types";

interface MyMediaDevices extends MediaDevices {
  getUserMedia: any;
  getDisplayMedia?: any;
}

interface MyNavigator extends Navigator {
  getUserMedia: any;
  webkitGetUserMedia?: any;
  mozGetUserMedia?: any;
  msGetUserMedia?: any;
  getDisplayMedia?: any;
  mediaDevices: MyMediaDevices;
}

const myNavigator: MyNavigator = navigator;

if (!myNavigator?.getUserMedia) {
  myNavigator.getUserMedia =
    myNavigator?.webkitGetUserMedia ||
    myNavigator?.mozGetUserMedia ||
    myNavigator?.msGetUserMedia;
}

export const getCamStream = async (
  media: MyMedia
): Promise<void | MediaStream> => {
  let stream;

  if (myNavigator.mediaDevices) {
    try {
      // @ts-ignore
      stream = await myNavigator.mediaDevices.getUserMedia(media);
    } catch (err: any) {
      handleCatch(err);
    }
  } else {
    try {
      // @ts-ignore
      stream = await myNavigator.getUserMedia(media);
    } catch (err: any) {
      handleCatch(err);
    }
  }

  return stream;
};

export const getScreenStream = async (): Promise<boolean | MediaStream> => {
  let stream;
  if (myNavigator.mediaDevices) {
    try {
      stream = await myNavigator.mediaDevices.getDisplayMedia();
    } catch (err: any) {
      handleCatch(err);
      return false;
    }
  } else {
    try {
      stream = await myNavigator.getDisplayMedia();
    } catch (err: any) {
      handleCatch(err);
      return false;
    }
  }

  return stream;
};
