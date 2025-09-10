import path from "node:path";
import _ from "@tensorflow/tfjs-node"; // in nodejs environments tfjs-node is required to be loaded before face-api
import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";
import { Face } from "./types";
import { logInfo } from "./logger";

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

const modelPathRoot = "model";

export async function init() {
  // @ts-ignore
  await faceapi.tf.setBackend("tensorflow");
  // @ts-ignore
  await faceapi.tf.ready();

  const modelPath = path.join(__dirname, modelPathRoot);

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath); // load models from a specific patch
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);

  logInfo({ message: "LOADED" });
}

export async function detectFace(data: Buffer) {
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.1,
    maxResults: 10,
  });

  // @ts-ignore
  const decodeT = faceapi.tf.node.decodeImage(data, 3); // decode binary buffer to rgb tensor
  const expandT = faceapi.tf.expandDims(decodeT, 0); // add batch dimension to tensor
  const result = await faceapi
    .detectAllFaces(expandT, options) // run detection
    .withFaceLandmarks();
  // @ts-ignore
  faceapi.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks
  return toFaces(result);
}

function toFaces(
  result: Array<
    faceapi.WithFaceLandmarks<
      {
        detection: faceapi.FaceDetection;
      },
      faceapi.FaceLandmarks68
    >
  >,
): Face[] {
  //TODO: return the biggest face only
  return result
    .slice(0, 1)
    .map((detection): Face | null => {
      const leftEyePoints = detection.landmarks.getLeftEye();
      const rightEyePoints = detection.landmarks.getRightEye();
      const mouthPoints = detection.landmarks.getMouth();

      if (
        !leftEyePoints.length ||
        !rightEyePoints.length ||
        !mouthPoints.length
      ) {
        return null;
      }

      const leftEye = leftEyePoints[Math.floor(leftEyePoints.length / 2)]!;
      const rightEye = rightEyePoints[Math.floor(rightEyePoints.length / 2)]!;
      const mouth = mouthPoints[Math.floor(mouthPoints.length / 2)]!;

      return {
        rect: {
          x: detection.alignedRect.box.x,
          y: detection.alignedRect.box.y,
          width: detection.alignedRect.box.width,
          height: detection.alignedRect.box.height,
        },
        angle: {
          pitch: detection.angle?.pitch ?? 0,
          roll: detection.angle?.roll ?? 0,
          yaw: detection.angle?.yaw ?? 0,
        },
        landmarks: {
          leftEye: { x: leftEye.x, y: leftEye.y },
          rightEye: { x: rightEye.x, y: rightEye.y },
          mouth: { x: mouth.x, y: mouth.y },
        },
      };
    })
    .filter(Boolean) as Face[];
}
