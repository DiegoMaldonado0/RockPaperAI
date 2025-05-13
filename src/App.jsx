import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function getWinner(user, ai) {
  if (user === ai) return "Empate 🤝";
  if (
    (user === "rock" && ai === "scissors") ||
    (user === "paper" && ai === "rock") ||
    (user === "scissors" && ai === "paper")
  ) return "Ganaste 🎉";
  return "Perdiste 😢";
}

export default function App() {
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
      console.error("Error al conectar con la API para predicción en vivo:", error);
      setCurrentHandSign(null);
    }
  };

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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
            setResult("¡Ganaste la partida! 🏆");
          }
          return newScore;
        });
      } else if (roundResult.includes("Perdiste")) {
        setAiScore((prev) => {
          const newScore = prev + 1;
          if (newScore === 5) {
            setGameOver(true);
            setResult("La IA ganó la partida 🤖");
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
    switch(sign) {
      case "rock": return "✊";
      case "paper": return "✋";
      case "scissors": return "✌️";
      default: return "👋";
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🧠 Piedra, Papel o Tijera</h1>
      <video ref={videoRef} style={{ display: "block", margin: "auto", transform: "scaleX(-1)" }} />
      
      {/* Add current hand sign display */}
      <div style={{ marginTop: "10px" }}>
        <h3>
          {handDetected 
            ? `Mano detectada: ${currentHandSign || "..."} ${currentHandSign ? getHandSignEmoji(currentHandSign) : ""}`
            : "No se detecta ninguna mano 👋"
          }
        </h3>
      </div>
      
      {countdown !== null && <h2>Mostrando en... {countdown}</h2>}
      <p><strong>Tu jugada:</strong> {prediction} {prediction !== "..." && getHandSignEmoji(prediction)}</p>
      <p><strong>IA jugó:</strong> {aiChoice} {aiChoice !== "..." && getHandSignEmoji(aiChoice)}</p>
      <h2>{result}</h2>
      <h3>🧍 Tú: {userScore} | 🤖 IA: {aiScore}</h3>
      {!gameOver && (
        <button 
          onClick={startRound} 
          disabled={isPlaying} 
          style={{ 
            fontSize: "1.2rem", 
            padding: "0.5rem 1rem", 
            marginTop: "1rem",
            opacity: handDetected ? 1 : 0.5 
          }}
        >
          {handDetected ? "¡Jugar ronda!" : "Muestra tu mano para jugar"}
        </button>
      )}
      {gameOver && (
        <button onClick={resetGame} style={{ fontSize: "1.2rem", padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Reiniciar juego
        </button>
      )}
    </div>
  );
}