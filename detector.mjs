import path from "node:path";
import { fileURLToPath } from "node:url";
import tf from "@tensorflow/tfjs-node"; // in nodejs environments tfjs-node is required to be loaded before face-api
import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

const modelPathRoot = "./model";

export async function init() {
  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.ready();

  const modelPath = path.join(__dirname, modelPathRoot);

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath); // load models from a specific patch
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);

  console.info("Loaded models");
}

export async function detectFace(data) {
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.1,
    maxResults: 10,
  });

  const decodeT = faceapi.tf.node.decodeImage(data, 3); // decode binary buffer to rgb tensor
  const expandT = faceapi.tf.expandDims(decodeT, 0); // add batch dimension to tensor
  const result = await faceapi
    .detectAllFaces(expandT, options) // run detection
    .withFaceLandmarks();
  // .withFaceExpressions()
  // .withFaceDescriptors();
  //.withAgeAndGender();
  faceapi.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks
  // console.log(JSON.stringify(result[0].landmarks, null, 2)); // eslint-disable-line no-console
  return result;
}
