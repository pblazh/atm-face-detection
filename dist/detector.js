"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.detectFace = detectFace;
const node_path_1 = __importDefault(require("node:path"));
const faceapi = __importStar(require("@vladmandic/face-api"));
const canvas_1 = __importDefault(require("canvas"));
faceapi.env.monkeyPatch({
    Canvas: canvas_1.default.Canvas,
    Image: canvas_1.default.Image,
    ImageData: canvas_1.default.ImageData,
});
const modelPathRoot = "model";
async function init() {
    // @ts-ignore
    await faceapi.tf.setBackend("tensorflow");
    // @ts-ignore
    await faceapi.tf.ready();
    const modelPath = node_path_1.default.join(__dirname, modelPathRoot);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath); // load models from a specific patch
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
    console.info("Loaded models");
}
async function detectFace(data) {
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
    // .withFaceExpressions()
    // .withFaceDescriptors();
    //.withAgeAndGender();
    // @ts-ignore
    faceapi.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks
    // console.log(JSON.stringify(result[0].landmarks, null, 2)); // eslint-disable-line no-console
    return result;
}
//# sourceMappingURL=detector.js.map