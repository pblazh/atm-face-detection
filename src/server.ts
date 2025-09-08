import http from "node:http";
import { WebSocketServer } from "ws";
import { detectFace, init } from "./detector";

export async function startServer(port: number) {
  await init();
  const server = http.createServer({});
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    if (!ip) return;
    console.info(`Connected`, ip);

    ws.on("message", async (msg: Buffer) => {
      if (!msg) return;
      const result = await detectFace(msg);

      const first = result?.[0];
      if (!first) {
        ws.send(JSON.stringify([]));
        return;
      }

      ws.send(
        JSON.stringify([
          {
            rect: {
              x: first.alignedRect.box.x,
              y: first.alignedRect.box.y,
              width: first.alignedRect.box.width,
              height: first.alignedRect.box.height,
            },
            angle: {
              pitch: first.angle?.pitch ?? 0,
              roll: first.angle?.roll ?? 0,
              yaw: first.angle?.yaw ?? 0,
            },
            landmarks: {
              leftEye: first.landmarks.getLeftEye()[0],
              rightEye: first.landmarks.getRightEye()[0],
              mouth: first.landmarks.getMouth()[0],
            },
          },
        ]),
      );
    });

    ws.on("error", (err: Error) => {
      console.error(`Error ${err}`);
    });

    ws.on("close", (ev: Error) => {
      console.info(`Closed ${ev}`);
    });
  });

  wss.on("close", (ev: Error) => {
    console.info(`Server closed ${ev}`);
  });

  wss.on("error", (err: Error) => {
    console.info(`Server error ${err}`);
  });

  server.listen(port, () => console.info(`WSServer is starting on :${port}`));
}

