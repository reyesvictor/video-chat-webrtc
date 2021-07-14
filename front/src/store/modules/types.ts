import { MyMedia } from "./../../types";

export interface RoomState {
  id: string;
}

export interface IceServer {
  urls: string;
}

export interface RTCState {
  peers: Peer;
  iceServers: IceServer[];
  media: MyMedia;
  stream: MediaStream;
  status: Status;
}

export interface Peer {
  [key: string]: RTCPeerConnection;
}

export interface Status {
  CAN_CONNECT: boolean;
  AUDIO_ACTIVE: boolean;
  VIDEO_ACTIVE: boolean;
}

export interface StreamTrade {
  joined: string;
  present: string;
}

export interface VideoSize {
  width: number;
  height: number;
}
