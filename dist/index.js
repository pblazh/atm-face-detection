"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const ws_1 = require("ws");
const detector_1 = require("./detector");
async function startServer(port) {
    await (0, detector_1.init)();
    const server = node_http_1.default.createServer({});
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
        const ip = req.socket.remoteAddress;
        if (!ip)
            return;
        console.info(`Connected`, ip);
        ws.on("message", async (msg) => {
            if (!msg)
                return;
            const result = await (0, detector_1.detectFace)(msg);
            const first = result?.[0];
            if (!first) {
                ws.send(JSON.stringify([]));
                return;
            }
            ;
            ws.send(JSON.stringify(([{
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
                }])));
        });
        ws.on("error", (err) => {
            console.error(`Error ${err}`);
        });
        ws.on("close", (ev) => {
            console.info(`Closed ${ev}`);
        });
    });
    wss.on("close", (ev) => {
        console.info(`Server closed ${ev}`);
    });
    wss.on("error", (err) => {
        console.info(`Server error ${err}`);
    });
    server.listen(port, () => console.info(`WSServer is starting on :${port}`));
}
function main() {
    startServer(8080).then(console.log).catch(console.error);
}
main();
//# sourceMappingURL=index.js.map