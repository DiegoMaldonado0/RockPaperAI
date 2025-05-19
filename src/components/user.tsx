import { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Video from "./video";

export default function User() {
  const videoRef = useRef(null);
  const [latestLandmarks, setLatestLandmarks] = useState<null | number[]>(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0 &&
        results.multiHandedness
      ) {
        const handLandmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0].label;

        let landmarks = handLandmarks.map((lm) => [lm.x, lm.y]).flat();

        if (handedness === "Left") {
          // Refleja los valores en X para que coincidan con entrenamiento
          landmarks = landmarks.map((value, index) =>
            index % 2 === 0 ? 1 - value : value
          );
        }

        setLatestLandmarks(landmarks);
      } else {
        setLatestLandmarks(null);
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }
  }, []); // <- Cierra correctamente el useEffect aquí

  return (
    <div className="w-full h-full">
      <Video />
    </div>
  );
}
