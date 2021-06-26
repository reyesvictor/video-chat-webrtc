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
  workflow: any; // error here when selecting video
}

export interface Peer {
  [key: string]: RTCPeerConnection;
}

export interface Workflow {
  video: {
    STARTED: boolean;
  };
}

export interface StreamTrade {
  joined: string;
  present: string;
}
