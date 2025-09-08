const WIDTH = 640;
const HEIGHT = 480;

async function getFrame(socket) {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
  
  canvas.toBlob(
    async (data) => {
      socket.send(data);
    },
    "image/jpeg",
    0.9,
  );
  
}

function drawResult(rect, angle, landmarks) {
  const canvas = document.getElementById("overlay");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.font = "16px sans-serif";

  ctx.beginPath();

  ctx.fillText("roll:" + angle.roll, 10, 20);
  ctx.fillText("pitch:" + angle.pitch, 10, 40);
  ctx.fillText("yaw:" + angle.yaw, 10, 60);

  ctx.rect(rect.x, rect.y, rect.width, rect.height);

  landmarks.forEach((landmark) => {
    ctx.rect(landmark._x, landmark._y, 4, 4);
  });

  ctx.stroke();
}

function main() {
 const socket = new WebSocket("ws://127.0.0.1:8080");

  socket.addEventListener("open", (event) => {
    console.log("Connected to the Server!", event);
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (!message || !message.length) {
      requestAnimationFrame(() => {
        getFrame(socket);
      });
      return
    }

    const rect = message[0].rect;
    const angle = message[0].angle;
    const landmarks = message[0].landmarks;

    console.log("Drawing results", rect, angle, landmarks);
    if (rect && angle && landmarks) {
      drawResult(rect, angle, [
        landmarks.leftEye,
        landmarks.rightEye,
        landmarks.mouth,
      ]);
    }
    requestAnimationFrame(() => {
      getFrame(socket);
    });
  });
 
  navigator.mediaDevices
    .getUserMedia({ video: { width: WIDTH, height: HEIGHT }, audio: false })
    .then((stream) => {
      const video = document.getElementById("video");
      video.srcObject = stream;
      return video.play();
    })
    .then(async () => {
      getFrame(socket);
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  console.log("Client started");
}

main();
