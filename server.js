const http = require( "node:http");
const { WebSocketServer } = require( "ws");
const { detectFace, init } = require("./detector.js");

async function startServer(port) {
  await init();
  const server = http.createServer({});
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {

    const ip = req.socket.remoteAddress;
    if (!ip) return;
        console.info(`Connected`, ip);


    ws.on("message", async (msg) => {
      if (!msg) return;
      const result = await detectFace(msg);
      console.log("Detection result", result);
      if (!result || !result.length) {
        ws.send(JSON.stringify([]));
        return;
      }; 

      const first = result[0];


      ws.send(
        JSON.stringify(
          ([{
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
          }]),
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
