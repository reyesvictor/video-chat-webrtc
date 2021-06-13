import { MyMedia } from "./../../types";

export interface RoomState {
  id: string;
  name: string;
}

export interface IceServer {
  urls: string;
}

export interface RTCState {
  peers: Peer;
  iceServers: IceServer[];
  media: MyMedia;
  stream: MediaStream;
  workflow: Workflow;
}

export interface Peer {
  [key: string]: RTCPeerConnection;
}

export interface Workflow {
  workflow: {
    video: {
      STARTED: boolean;
    };
  };
}

export interface StreamCommunication {
  joined: string;
  present: string;
}
