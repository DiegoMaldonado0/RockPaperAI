import { useRef, useEffect } from "react";

export default function Video() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Solicitar acceso a la cámara del usuario
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream; // Asignar el flujo de video al elemento <video>
          videoRef.current.play(); // Reproducir el video
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });
  }, []);

  return (
    <div
      id="userCamera"
      className="top-1 w-full h-full min-h-20 ring-4 m-auto shadow-xl"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      ></video>
    </div>
  );
}
