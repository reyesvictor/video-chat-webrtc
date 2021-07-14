export interface Person {
  firstName: string;
  lastName: string;
  age: number;
}

export type MyMediaStream = boolean | void | MediaStream;

export interface MyMedia {
  audio: boolean;
  video: {
    width: number;
    height: number;
  };
}
