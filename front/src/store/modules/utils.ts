import { toast } from "@/services/ToastService";

export const STREAMS_TYPE = ["cam", "screen"];
export const CAM_TYPE = "cam";
export const SCREEN_TYPE = "screen";

export const handleSocketResult = (success: string, err: string) => {
  if (err) {
    console.log(err);
    toast("error", err);
    return false;
  } else {
    console.log(success);
    toast("success", success);
    return true;
  }
};

export const handleCatch = (err: string) => {
  console.log(err);
  toast("error", err);
};
