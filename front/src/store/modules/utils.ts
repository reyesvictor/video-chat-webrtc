import { toast } from "@/services/ToastService";

// The joys of typescript 👍
export const w: any = window;
export const doc: any = document;

export const STREAMS_TYPE = ["cam", "screen"];
export const CAM_TYPE = "cam";
export const SCREEN_TYPE = "screen";

export const handleSocketResult = (success: string, err: string) => {
  if (err) {
    console.log(err);
    handleCatch(err);
    return false;
  } else {
    console.log(success);
    toast("success", success);
    return true;
  }
};

export const handleCatch = (err: string) => {
  toast("error", err);
  console.error("⚠💥 " + err);
};
