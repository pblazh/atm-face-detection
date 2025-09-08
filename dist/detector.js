"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.detectFace = detectFace;
const node_path_1 = __importDefault(require("node:path"));
const face_api_1 = __importDefault(require("@vladmandic/face-api"));
const canvas_1 = __importDefault(require("canvas"));
face_api_1.default.env.monkeyPatch({
    Canvas: canvas_1.default.Canvas,
    Image: canvas_1.default.Image,
    ImageData: canvas_1.default.ImageData,
});
const modelPathRoot = "./model";
async function init() {
    // @ts-ignore
    await face_api_1.default.tf.setBackend("tensorflow");
    // @ts-ignore
    await face_api_1.default.tf.ready();
    const modelPath = node_path_1.default.join(__dirname, modelPathRoot);
    await face_api_1.default.nets.ssdMobilenetv1.loadFromDisk(modelPath); // load models from a specific patch
    await face_api_1.default.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await face_api_1.default.nets.ageGenderNet.loadFromDisk(modelPath);
    await face_api_1.default.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await face_api_1.default.nets.faceExpressionNet.loadFromDisk(modelPath);
    console.info("Loaded models");
}
async function detectFace(data) {
    const options = new face_api_1.default.SsdMobilenetv1Options({
        minConfidence: 0.1,
        maxResults: 10,
    });
    // @ts-ignore
    const decodeT = face_api_1.default.tf.node.decodeImage(data, 3); // decode binary buffer to rgb tensor
    const expandT = face_api_1.default.tf.expandDims(decodeT, 0); // add batch dimension to tensor
    const result = await face_api_1.default
        .detectAllFaces(expandT, options) // run detection
        .withFaceLandmarks();
    // .withFaceExpressions()
    // .withFaceDescriptors();
    //.withAgeAndGender();
    // @ts-ignore
    face_api_1.default.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks
    // console.log(JSON.stringify(result[0].landmarks, null, 2)); // eslint-disable-line no-console
    return result;
}
//# sourceMappingURL=detector.js.map