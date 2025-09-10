export type DetectionResult = {
  detection: {
    _box: {
      _x: number;
      _y: number;
      _width: number;
      _height: number;
    };
  };
  angle: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  landmarks: {
    _positions: { _x: number; _y: number }[];
  };
};

export type Face = {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  angle: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  landmarks: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    mouth: { x: number; y: number };
  };
};
