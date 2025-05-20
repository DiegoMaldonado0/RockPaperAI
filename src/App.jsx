import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Top from "./components/top";
import Button from "./components/button";
import Card from "./components/card";
import Timer from "./components/timer";
import "./App.css";

function getWinner(user, ai) {
  if (user === ai) return "Empate 🤝";
  if (
    (user === "rock" && ai === "scissors") ||
    (user === "paper" && ai === "rock") ||
    (user === "scissors" && ai === "paper")
  )
    return "Ganaste 🎉";
  return "Perdiste 😢";
}

export default function App() {
  const [isClicked, setIsClicked] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const videoRef = useRef(null);
  const [prediction, setPrediction] = useState("...");
  const [aiChoice, setAiChoice] = useState("...");
  const [result, setResult] = useState("Esperando jugada...");
  const [countdown, setCountdown] = useState(null);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Add new state for current detected hand position
  const [currentHandSign, setCurrentHandSign] = useState(null);
  // Add state to track if hand is detected at all
  const [handDetected, setHandDetected] = useState(false);

  const API_URL = "http://localhost:8000/predict";
  const options = ["rock", "paper", "scissors"];

  // Change to state instead of variable to ensure it's preserved between renders
  const [latestLandmarks, setLatestLandmarks] = useState(null);

  // Add function to continuously predict the current hand sign
  const updateCurrentHandSign = async (landmarks) => {
    if (!landmarks) {
      setCurrentHandSign(null);
      setHandDetected(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ landmarks }),
      });

      const data = await response.json();
      setCurrentHandSign(data.prediction);
      setHandDetected(true);
    } catch (error) {
      console.error(
        "Error al conectar con la API para predicción en vivo:",
        error
      );
      setCurrentHandSign(null);
    }
  };

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
          landmarks = landmarks.map((value, index) =>
            index % 2 === 0 ? 1 - value : value
          );
        }

        // Update state instead of variable
        setLatestLandmarks(landmarks);
        setHandDetected(true);
      } else {
        setLatestLandmarks(null);
        setHandDetected(false);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  // Add effect to continuously update current hand sign
  useEffect(() => {
    // Don't make API calls if we're in the middle of a game round
    if (isPlaying || countdown !== null) return;

    // Only update if we have landmarks
    if (latestLandmarks) {
      // Set a delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        updateCurrentHandSign(latestLandmarks);
      }, 300); // Update every 300ms for smoother experience

      return () => clearTimeout(timeoutId);
    }
  }, [latestLandmarks, isPlaying, countdown]);

  const startRound = () => {
    if (isPlaying || gameOver) return;

    // Ensure we have a hand before starting
    if (!handDetected) {
      setResult("No se detectó una mano. Muestra tu mano a la cámara 🙁");
      return;
    }

    setIsPlaying(true);
    setPrediction("...");
    setAiChoice("...");
    setResult("Preparado...");
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        playRound();
      }
    }, 1000);
  };

  const playRound = async () => {
    // Use the state version of latestLandmarks
    if (!latestLandmarks) {
      setResult("No se detectó una mano 🙁");
      setIsPlaying(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ landmarks: latestLandmarks }),
      });

      const data = await response.json();
      const user = data.prediction;
      const ai = options[Math.floor(Math.random() * 3)];
      const roundResult = getWinner(user, ai);

      setPrediction(user);
      setAiChoice(ai);
      setResult(roundResult);

      if (roundResult.includes("Ganaste")) {
        setUserScore((prev) => {
          const newScore = prev + 1;
          if (newScore === 5) {
            setGameOver(true);
            setResult("YOU WIN");
          }
          return newScore;
        });
      } else if (roundResult.includes("Perdiste")) {
        setAiScore((prev) => {
          const newScore = prev + 1;
          if (newScore === 5) {
            setGameOver(true);
            setResult("YOU LOSE");
          }
          return newScore;
        });
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      setResult("Error en la predicción");
    }

    setIsPlaying(false);
  };

  const resetGame = () => {
    setUserScore(0);
    setAiScore(0);
    setGameOver(false);
    setResult("Esperando jugada...");
    setPrediction("...");
    setAiChoice("...");
  };

  // Map the signs to emojis for better visual feedback
  const getHandSignEmoji = (sign) => {
    switch (sign) {
      case "rock":
        return "✊";
      case "paper":
        return "✋";
      case "scissors":
        return "✌️";
      default:
        return "👋";
    }
  };

  const handleClick = () => {
    setIsClicked(true);

    setTimeout(() => {
      setIsHidden(true);
    }, 2000);
  };

  return (
    <div
      id="Body"
      className="w-full h-dvh border-4 inset-shadow-sm grid grid-cols-3 grid-rows-[0.5fr_4.5fr]"
    >
      <header
        id="Header"
        className="col-span-3 row-start-1 flex justify-center items-center z-0 mb-0 mt-4"
      >
        <Top></Top>
      </header>
      <main
        className="col-span-3 row-start-2 overflow-auto 
      grid grid-flow-col grid-cols-3 grid-rows-3 z-10 mt-4"
      >
        <section
          id="you"
          className="row-start-1 row-end-4 col-start-1
          grid grid-flow-col grid-cols-1 grid-rows-3"
        >
          <article
            id="cardRock"
            className="col-start-1 row-start-1 flex justify-center items-center -rotate-4"
          >
            <Card type="Rock" animations={1}></Card>
          </article>
          <article
            id="cardPapper"
            className="col-start-1 row-start-2 flex justify-center items-center rotate-2"
          >
            <Card type="Paper" animations={2}></Card>
          </article>
          <article
            id="cardScissors"
            className="col-start-1 row-start-3 flex justify-center items-center -rotate-5"
          >
            <Card type="Scissors" animations={3}></Card>
          </article>
          <article className="col-start-1 row-end-4 flex justify-center items-end relative">
            <p>
              <strong>Tu</strong>
            </p>
          </article>
        </section>
        <section className="col-start-2 row-end-3 min-h-30">
          <video
            ref={videoRef}
            className="m-auto block border-4 w-full h-full object-cover "
            style={{
              display: "block",
              margin: "auto",
              transform: "scaleX(-1)",
            }}
          />
        </section>
        {isHidden ? (
          <>
            <div id="indicador" className="relative col-start-2 row-start-1">
              <p
                className={`text-neutral-300 font-bold flex justify-center items-end h-full 
            realtive transition-opacity duration-1000 ease-in-out z-0 text-nowrap`}
              >
                {handDetected
                  ? `${currentHandSign || prediction} ${
                      currentHandSign ? getHandSignEmoji(currentHandSign) : ""
                    }`
                  : "Muestra tu mano al finalizar el contador"}
              </p>
            </div>
            <section
              id="timer"
              className="col-start-2 row-start-3 flex justify-center items-center z-0"
            >
              <Timer></Timer>
            </section>
          </>
        ) : (
          <section
            id="startBoton"
            className="col-start-2 row-start-3 flex justify-center items-start relative top-2 z-0"
          >
            <Button
              isClicked={isClicked}
              isHidden={isHidden}
              onClick={handleClick}
              type="START"
            ></Button>
          </section>
        )}
        <section
          id="ai"
          className="row-start-1 row-end-4 col-start-3
          grid grid-flow-col grid-cols-1 grid-rows-3 
          relative right-2"
        >
          <article
            id="puntuacionAi"
            className="col-start-1 row-start-1 flex justify-center items-start"
          >
            <h2
              className="text-4xl text-neutral-300 font-bold 
              transition-opacity duration-1000 ease-in-out"
            >
              {aiScore}
            </h2>
          </article>
          <article
            id="cardRock"
            className="col-start-1 row-start-1 flex justify-center items-center rotate-4"
          >
            <Card type="Rock" animations={2}></Card>
          </article>
          <article
            id="cardPapper"
            className="col-start-1 row-start-2 flex justify-center items-center -rotate-2"
          >
            <Card type="Paper" animations={1}></Card>
          </article>
          <article
            id="cardScissors"
            className="col-start-1 row-start-3 flex justify-center items-center rotate-5"
          >
            <Card type="Scissors" animations={2}></Card>
          </article>
          <article className="col-start-1 row-end-4 flex justify-center items-end relative">
            <p>
              <strong>IA</strong>
            </p>
          </article>
        </section>
      </main>

      <h3>
        🧍 Tú: {userScore} | 🤖 IA: {aiScore}
      </h3>
      {!gameOver && (
        <button
          onClick={startRound}
          disabled={isPlaying}
          style={{
            fontSize: "1.2rem",
            padding: "0.5rem 1rem",
            marginTop: "1rem",
            opacity: handDetected ? 1 : 0.5,
          }}
        ></button>
      )}
      {gameOver && (
        <button
          onClick={resetGame}
          style={{
            fontSize: "1.2rem",
            padding: "0.5rem 1rem",
            marginTop: "1rem",
          }}
        >
          Reiniciar juego
        </button>
      )}
    </div>
  );
}
