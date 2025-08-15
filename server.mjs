import http from "node:http";
import { WebSocketServer } from "ws";
import { detectFace, init } from "./detector.mjs";

export async function startServer(port) {
  await init();
  const server = http.createServer({});
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    if (!ip) return;

    console.info(`Connected ${ip}`);

    ws.on("message", async (msg) => {
      if (!msg) return;
      const result = await detectFace(msg);
      ws.send(
        JSON.stringify(
          result({
            rect: {
              x: result.alignedRect.box.x,
              y: result.alignedRect.box.y,
              width: result.alignedRect.box.width,
              height: result.alignedRect.box.height,
            },
            angle: {
              pitch: result.angle?.pitch ?? 0,
              roll: result.angle?.roll ?? 0,
              yaw: result.angle?.yaw ?? 0,
            },
            landmarks: {
              leftEye: result.landmarks.getLeftEye()[0],
              rightEye: result.landmarks.getRightEye()[0],
              mouth: result.landmarks.getMouth()[0],
            },
          }),
        ),
      );
    });

    ws.on("error", (err) => {
      console.error(`Error ${err}`);
    });

    ws.on("close", (ev) => {
      console.info(`Closed ${ev}`);
    });
  });

  wss.on("close", (ev) => {
    logger.info(`Server closed ${ev}`);
  });

  wss.on("error", (err) => {
    logger.info(`Server error ${err}`);
  });

  server.listen(port, () => console.info(`WSServer is starting on :${port}`));
}

function main() {
  startServer(8080).then(console.log).catch(console.error);
}

main();
