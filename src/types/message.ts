export enum VerifyResult {
  CustomVerificationFailed = -8,
  InvalidData = -7,
  InvalidVerification = -6,
  InvalidTimestamp = -5,
  PubKeyMismatch = -4,
  NoProofOfWork = -3,
  InvalidHashNonce = -2,
  InvalidSignature = -1,
  Verified = 1,
}

export interface VerificationData<T = any> {
  k: string; // Key/id
  p: string; // public key
  n: number; // nonce
  h: string; // hash of JSON.stringify(value) + nonce
  t: number; // Timestamp this was created
  s: string; // signature
  v: T; // value
}

export type MessageType =
  | "ping"
  | "pong"
  | "query"
  | "queryAck"
  | "subscribe"
  | "get"
  | "put"
  | "crdtPut";

export interface BaseMessage {
  type: MessageType;
  id: string; // unique random id for the message, to ack back
}

export interface PingMessage extends BaseMessage {
  type: "ping";
}

export interface PongMessage extends BaseMessage {
  type: "pong";
}

export interface QueryMessage extends BaseMessage {
  type: "query";
  key: string; // key we want to get
  to: string[]; // who was this message sent to already
}

export interface QueryAckMessage extends BaseMessage {
  type: "queryAck";
  keys: string[];
}

export interface SubscribeMessage extends BaseMessage {
  type: "subscribe";
  key: string;
}

export interface GetMessage extends BaseMessage {
  type: "get";
  key: string; // key we want to get
  to: string[]; // who was this message sent to already
}

export interface PutMessage<T = any> extends BaseMessage, VerificationData<T> {
  type: "put";
}

export type ToolDbMessage =
  | PingMessage
  | PongMessage
  | QueryMessage
  | QueryAckMessage
  | SubscribeMessage
  | GetMessage
  | PutMessage;
