// Contain all the types for this apparent
// can use Paste JSON as TYPES
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
