import { useRef, useEffect } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

interface CameraFeedProps {
  onHandDetected: (isHandDetected: boolean) => void; // Callback to notify if a hand is detected
}

export default function CameraFeed({ onHandDetected }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const isHandDetected =
        results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
      onHandDetected(isHandDetected); // Notify parent component
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      hands.close();
    };
  }, [onHandDetected]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute w-full h-full border-4 "
        autoPlay
        muted
      />
    </div>
  );
}
