import http from "node:http";
import { WebSocketServer } from "ws";
import { detectFace, init } from "./detector";
import { logError, logInfo } from "./logger";
import { AddressInfo } from "node:net";

export async function startServer(port: number) {
  await init();

  return new Promise((_, reject) => {
    const server = http.createServer({});
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
      const ip = req.socket.remoteAddress;
      if (!ip) return;

      ws.on("message", async (msg: Buffer) => {
        if (!msg) return;
        const result = await detectFace(msg);

        const first = result?.[0];
        if (!first) {
          ws.send(JSON.stringify([]));
          return;
        }

        ws.send(JSON.stringify(result));
      });

      ws.on("error", (err: Error) => {
        logError(err);
      });

      ws.on("open", (event: Event) => {
        logInfo({ message: "CONNECTED", event });
      });
      ws.on("close", (event: Event) => {
        logInfo({ message: "DISCONNECTED", event });
      });
    });

    wss.on("close", (event: Event) => {
      logInfo({ message: "CLOSED", event });
      reject(event);
    });

    wss.on("error", (err: Error) => {
      logError(err);
    });

    server.on("error", (err: Error) => {
      logError(err);
    });

    server.on("close", (event: Event) => {
      logInfo({ message: "CLOSED", event });
      reject(event);
    });

    server.listen(port, () => {
      logInfo({ message: "LISTENING", port });
    });

    logInfo({ message: "STARTED", address: server.address() as AddressInfo });

    return server;
  });
}
