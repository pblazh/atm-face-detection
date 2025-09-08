import faceapi from "@vladmandic/face-api";
export declare function init(): Promise<void>;
export declare function detectFace(data: Buffer): Promise<faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]>;
//# sourceMappingURL=detector.d.ts.map