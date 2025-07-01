import { useState, useEffect, useRef } from "react";
import timerSound from "../assets/sounds/timer.mp3";
import startSound from "../assets/sounds/start.mp3";

export default function Timer({ setChoice, setIsVideoVisible }) {
  const [count, setCount] = useState(4);
  const [isShow, setIsShow] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const timerAudio = useRef(null);
  const startAudio = useRef(null);

  useEffect(() => {
    timerAudio.current = new Audio(timerSound);
    timerAudio.current.preload = "auto";
    timerAudio.current.load();
  }, []);
  useEffect(() => {
    startAudio.current = new Audio(startSound);
    startAudio.current.preload = "auto";
    startAudio.current.load();
  }, []);

  useEffect(() => {
    if (count > -1) {
      const countTimer = setTimeout(() => setCount(count - 1), 600);
      return () => {
        clearTimeout(countTimer);
      };
    }

    if (count === -1) {
      // Llamar setChoice inmediatamente cuando el contador llega a -1
      setChoice(true);

      setTimeout(() => {
        setIsShow(false);
      }, 100);

      setTimeout(() => {
        setIsHidden(true);
      }, 500);
    }
  }, [count, setChoice, setIsVideoVisible]);

  useEffect(() => {
    if (count > 0 && count < 4) {
      // timerAudio.current.pause();
      timerAudio.current.currentTime = 0;
      timerAudio.current.volume = 0.2;
      timerAudio.current.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
    if (count === 0) {
      startAudio.current.currentTime = 0;
      startAudio.current.volume = 0.5;
      startAudio.current.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
  }, [count]);

  return (
    <div
      className={`text-8xl text-white text-shadow-lg/30 text-shadow-amber-400 font-bold flex justify-center items-center h-full relative 
        transition-opacity duration-1000 ease-in-out z-0
        ${!isShow ? "opacity-0" : "opacity-100"}
        ${isHidden && "hidden"}
        ${count < 1 && "text-shadow-green-800"}`}
    >
      {(() => {
        switch (count) {
          case 4:
            return "";
          case 3:
            return "3";
          case 2:
            return "2";
          case 1:
            return "1";
          default:
            return "GO!";
        }
      })()}
    </div>
  );
}
