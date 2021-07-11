import { handleCatch } from "@/store/modules/utils";

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
  constraints: MediaStreamConstraints
): Promise<MediaStream> => {
  let stream;

  if (myNavigator.mediaDevices) {
    try {
      stream = await myNavigator.mediaDevices.getUserMedia(constraints);
    } catch (err: any) {
      handleCatch(err);
    }
  } else {
    try {
      stream = await myNavigator.getUserMedia(constraints);
    } catch (err: any) {
      handleCatch(err);
    }
  }

  console.log("🎋🎋🎋🎋🎋🎋", constraints, stream);

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

export const doc: any = document;

export const getFullscreenElement = () => {
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullscreenElement ||
    doc.msFullscreenElement
  );
};

export const toggleFullscreen = (selector: string) => {
  if (selector.length === 0) {
    return handleCatch(
      "Selector to toggle video element in fullscreen does not exist"
    );
  }

  console.log("toggleFullscreen: ", selector);
  if (getFullscreenElement()) {
    document.exitFullscreen();
  } else {
    document.querySelector(selector)?.requestFullscreen().catch(console.log);
  }
};
