import { AddressInfo } from "net";

export type AppEvent =
  | {
      message: "STARTED";
      address: AddressInfo;
    }
  | {
      message: "RESTARTING";
    }
  | {
      message: "LISTENING";
      port: number;
    }
  | {
      message: "LOADED";
    }
  | {
      message: "CLOSED";
      event: Event;
    }
  | {
      message: "CONNECTED";
      event: Event;
    }
  | {
      message: "DISCONNECTED";
      event: Event;
    };

export type AppError = {
  message: "ERROR";
  error: string;
  cause?: unknown;
};
