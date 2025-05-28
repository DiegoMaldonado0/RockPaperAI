import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Top from "./components/top";
import Button from "./components/button";
import Card from "./components/card";
import Timer from "./components/timer";
import "./App.css";

export default function App() {
  // UI States
  const [isClicked, setIsClicked] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [Choice, setChoice] = useState(false);
  
  // Game States
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState("Presiona START para comenzar");
  const [timerKey, setTimerKey] = useState(0); // Para forzar re-render del timer
  
  // Hand Detection States
  const videoRef = useRef(null);
  const [currentHandSign, setCurrentHandSign] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [handedness, setHandedness] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [gestureHistory, setGestureHistory] = useState([]);
  
  const options = ["rock", "paper", "scissors"];
  const historySize = 5;

  // Game Logic
  const getWinner = (user, ai) => {
    if (user === ai) return "Empate 🤝";
    if (
      (user === "rock" && ai === "scissors") ||
      (user === "paper" && ai === "rock") ||
      (user === "scissors" && ai === "paper")
    )
      return "Ganaste 🎉";
    return "Perdiste 😢";
  };

  const playRound = () => {
    if (!handDetected || !currentHandSign) {
      setResult("No se detectó una mano válida 🙁");
      setIsGameActive(false);
      setIsHidden(false);
      setChoice(false);
      return;
    }

    const user = currentHandSign;
    const ai = options[Math.floor(Math.random() * 3)];
    const roundResult = getWinner(user, ai);

    setUserChoice(user);
    setAiChoice(ai);
    setResult(roundResult);

    // Update scores
    if (roundResult.includes("Ganaste")) {
      const newUserScore = userScore + 1;
      setUserScore(newUserScore);
      if (newUserScore === 5) {
        setGameOver(true);
        setResult("¡GANASTE EL JUEGO! 🏆");
        setIsGameActive(false);
        setIsHidden(false);
        setChoice(false);
        return;
      }
    } else if (roundResult.includes("Perdiste")) {
      const newAiScore = aiScore + 1;
      setAiScore(newAiScore);
      if (newAiScore === 5) {
        setGameOver(true);
        setResult("PERDISTE EL JUEGO 😢");
        setIsGameActive(false);
        setIsHidden(false);
        setChoice(false);
        return;
      }
    }

    setIsGameActive(false);
    
    // Preparar para la siguiente ronda después de 3 segundos
    setTimeout(() => {
      if (!gameOver) {
        setChoice(false);
        setIsHidden(false);
        setUserChoice(null);
        setAiChoice(null);
        setResult("Presiona START para la siguiente ronda");
      }
    }, 3000);
  };

  const startGame = () => {
    if (gameOver) return;
    setIsGameActive(true);
    setUserChoice(null);
    setAiChoice(null);
    setResult("Preparado...");
    setTimerKey(prev => prev + 1); // Forzar re-render del timer
  };

  const resetGame = () => {
    setUserScore(0);
    setAiScore(0);
    setGameOver(false);
    setIsGameActive(false);
    setUserChoice(null);
    setAiChoice(null);
    setResult("Presiona START para comenzar");
    setChoice(false);
    setIsClicked(false);
    setIsHidden(false);
    setGestureHistory([]);
    setTimerKey(prev => prev + 1);
  };

  // Handle timer completion - SIMPLIFICADO
  useEffect(() => {
    if (Choice && isGameActive) {
      playRound();
    }
  }, [Choice]); // Solo depende de Choice

  // Hand Detection Functions (keeping the existing robust detection logic)
  const analyzeFingers = (landmarks, isRightHand) => {
    const fingers = {
      thumb: analyzeFinger(landmarks, [1, 2, 3, 4], 'thumb', isRightHand),
      index: analyzeFinger(landmarks, [5, 6, 7, 8], 'index', isRightHand),
      middle: analyzeFinger(landmarks, [9, 10, 11, 12], 'middle', isRightHand),
      ring: analyzeFinger(landmarks, [13, 14, 15, 16], 'ring', isRightHand),
      pinky: analyzeFinger(landmarks, [17, 18, 19, 20], 'pinky', isRightHand)
    };
    return fingers;
  };

  const analyzeFinger = (landmarks, joints, fingerType, isRightHand) => {
    const [base, pip, dip, tip] = joints;
    
    if (fingerType === 'thumb') {
      return analyzeThumb(landmarks, joints, isRightHand);
    }
    
    const tipY = landmarks[tip].y;
    const pipY = landmarks[pip].y;
    const baseY = landmarks[base].y;
    
    const isExtended = (tipY < pipY - 0.02) && (tipY < baseY);
    
    const v1 = {
      x: landmarks[pip].x - landmarks[base].x,
      y: landmarks[pip].y - landmarks[base].y
    };
    const v2 = {
      x: landmarks[tip].x - landmarks[pip].x,
      y: landmarks[tip].y - landmarks[pip].y
    };
    
    const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
    const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
    
    return {
      extended: isExtended,
      angle: normalizedAngle,
      confidence: Math.abs(normalizedAngle) < Math.PI/4 ? 0.9 : 0.6
    };
  };

  const analyzeThumb = (landmarks, joints, isRightHand) => {
    const thumbToIndex = Math.hypot(
      landmarks[4].x - landmarks[8].x,
      landmarks[4].y - landmarks[8].y
    );
    
    let isExtended;
    if (isRightHand) {
      isExtended = landmarks[4].x > landmarks[3].x && thumbToIndex > 0.08;
    } else {
      isExtended = landmarks[4].x < landmarks[3].x && thumbToIndex > 0.08;
    }
    
    return {
      extended: isExtended,
      angle: 0,
      confidence: thumbToIndex > 0.05 ? 0.8 : 0.6
    };
  };

  const calculateConfidence = (landmarks, fingerAnalysis) => {
    const avgFingerConfidence = Object.values(fingerAnalysis)
      .reduce((sum, finger) => sum + finger.confidence, 0) / 5;
    return Math.min(avgFingerConfidence, 0.95);
  };

  const classifyGesture = (fingerAnalysis, confidence) => {
    const extendedFingers = Object.values(fingerAnalysis)
      .filter(finger => finger.extended).length;
    
    const indexExt = fingerAnalysis.index.extended;
    const middleExt = fingerAnalysis.middle.extended;
    const ringExt = fingerAnalysis.ring.extended;
    const pinkyExt = fingerAnalysis.pinky.extended;
    
    if (extendedFingers === 0 || extendedFingers === 1) {
      return "rock";
    }
    
    if (extendedFingers >= 4) {
      return "paper";
    }
    
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      return "scissors";
    }
    
    if (extendedFingers === 2) return "scissors";
    if (extendedFingers === 3) return "paper";
    
    return "rock";
  };

  const detectHandGesture = (landmarks, handedness) => {
    const isRightHand = handedness === 'Right';
    const fingerAnalysis = analyzeFingers(landmarks, isRightHand);
    const gestureConfidence = calculateConfidence(landmarks, fingerAnalysis);
    const gesture = classifyGesture(fingerAnalysis, gestureConfidence);
    
    return {
      gesture: gesture,
      confidence: gestureConfidence,
      fingerStates: fingerAnalysis,
      handedness: handedness
    };
  };

  const stabilizeGesture = (currentGesture) => {
    const newHistory = [...gestureHistory, currentGesture];
    if (newHistory.length > historySize) {
      newHistory.shift();
    }
    
    setGestureHistory(newHistory);
    
    const counts = {};
    newHistory.forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
    });
    
    if (Object.keys(counts).length === 0) return currentGesture;
    
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  };

  // MediaPipe setup
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => {
      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0 &&
        results.multiHandedness
      ) {
        const handLandmarks = results.multiHandLandmarks[0];
        const detectedHandedness = results.multiHandedness[0].label;

        const analysis = detectHandGesture(handLandmarks, detectedHandedness);
        const stableGesture = stabilizeGesture(analysis.gesture);

        setCurrentHandSign(stableGesture);
        setHandDetected(true);
        setHandedness(detectedHandedness);
        setConfidence(analysis.confidence);
      } else {
        setCurrentHandSign(null);
        setHandDetected(false);
        setHandedness(null);
        setConfidence(0);
      }
    });

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

    return () => {
      camera.stop();
    };
  }, []);

  const getHandSignEmoji = (sign) => {
    switch (sign) {
      case "rock": return "✊";
      case "paper": return "✋";
      case "scissors": return "✌️";
      default: return "👋";
    }
  };

  const handleClick = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    
    setIsClicked(true);
    
    setTimeout(() => {
      startGame();
      setIsHidden(true);
    }, 100);
  };

  return (
    <div
      id="Body"
      className="w-full h-dvh border-4 inset-shadow-sm grid grid-cols-3 grid-rows-[0.5fr_4.5fr] overflow-hidden"
    >
      <header
        id="Header"
        className="col-span-3 row-start-1 flex justify-center items-center z-0 mb-0 mt-4"
      >
        <Top></Top>
      </header>
      
      <main className="col-span-3 row-start-2 overflow-hidden grid grid-flow-col grid-cols-3 grid-rows-3 z-10 mt-4">
        {/* USER Section */}
        <section
          id="you"
          className="row-start-1 row-end-4 col-start-1 grid grid-flow-col grid-cols-1 grid-rows-3"
        >
          <div className="col-start-1 row-start-1 flex items-start justify-center text-2xl">
            <h2 className="text-neutral-300 font-bold transition-opacity duration-1000 ease-in-out z-0">
              YOU
            </h2>
          </div>
          <div className="col-start-1 row-start-1 row-end-4 flex items-center justify-center">
            <h2 className="text-neutral-300 font-bold opacity-30 transition-opacity duration-1000 ease-in-out z-0 text-[400px]">
              {userScore}
            </h2>
          </div>
          <article className="col-start-1 row-start-1 flex justify-center items-center -rotate-4">
            <Card type="Rock" animations={1}></Card>
          </article>
          <article className="col-start-1 row-start-2 flex justify-center items-center rotate-2">
            <Card type="Paper" animations={2}></Card>
          </article>
          <article className="col-start-1 row-start-3 flex justify-center items-center -rotate-5">
            <Card type="Scissors" animations={3}></Card>
          </article>
        </section>

        {/* CENTER Section - Video and Controls */}
        <section className="col-start-2 row-end-3 min-h-30 relative">
          <video
            ref={videoRef}
            className="m-auto block border-4 w-full h-full object-cover"
            style={{
              display: "block",
              margin: "auto",
              transform: "scaleX(-1)",
            }}
          />
          
          {/* Hand detection overlay */}
          {handDetected && currentHandSign && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getHandSignEmoji(currentHandSign)}</span>
                <div className="text-sm">
                  <div>{currentHandSign.toUpperCase()}</div>
                  <div>{handedness} Hand</div>
                  <div>Conf: {(confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          )}
          {!handDetected && (
            <div className="absolute top-2 left-2 bg-red-600 bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <div className="text-sm">No hand detected</div>
            </div>
          )}
        </section>

        {/* Game Status and Timer */}
        {isHidden ? (
          <>
            <div id="indicador" className="relative col-start-2 row-start-1">
              <p className="text-neutral-300 font-bold flex justify-center items-end h-full relative transition-opacity duration-1000 ease-in-out z-0 text-nowrap">
                {!Choice
                  ? "Muestra tu mano al finalizar el contador"
                  : userChoice && aiChoice
                  ? `Tu elección: ${userChoice} ${getHandSignEmoji(userChoice)} vs IA: ${aiChoice} ${getHandSignEmoji(aiChoice)}`
                  : "Procesando..."
                }
              </p>
            </div>
            <section
              id="timer"
              className="col-start-2 row-start-3 flex justify-center items-center z-0"
            >
              <Timer key={timerKey} setChoice={setChoice}></Timer>
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
              type={gameOver ? "RESET" : "START"}
            ></Button>
          </section>
        )}

        {/* AI Section */}
        <section
          id="ai"
          className="row-start-1 row-end-4 col-start-3 grid grid-flow-col grid-cols-1 grid-rows-3 relative right-2"
        >
          <div className="col-start-1 row-start-1 flex items-start justify-center text-2xl">
            <h2 className="text-neutral-300 font-bold transition-opacity duration-1000 ease-in-out z-0">
              AI
            </h2>
          </div>
          <div className="col-start-1 row-start-1 row-end-4 flex items-center justify-center">
            <h2 className="text-neutral-300 font-bold opacity-30 transition-opacity duration-1000 ease-in-out z-0 text-[400px]">
              {aiScore}
            </h2>
          </div>
          <article className="col-start-1 row-start-1 flex justify-center items-center rotate-4">
            <Card type="Rock" animations={2}></Card>
          </article>
          <article className="col-start-1 row-start-2 flex justify-center items-center -rotate-2">
            <Card type="Paper" animations={1}></Card>
          </article>
          <article className="col-start-1 row-start-3 flex justify-center items-center rotate-5">
            <Card type="Scissors" animations={2}></Card>
          </article>
        </section>
      </main>

      {/* Game Result Display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-10 py-10 rounded-lg text-center">
        <div className="text-lg font-bold">{result}</div>
        {(userChoice && aiChoice) && (
          <div className="text-lg mt-1">
            Tú: {getHandSignEmoji(userChoice)} vs IA: {getHandSignEmoji(aiChoice)}
          </div>
        )}
      </div>

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs">
          <div>Hand: {handDetected ? 'Detected' : 'Not detected'}</div>
          <div>Current: {currentHandSign || 'None'}</div>
          <div>Handedness: {handedness || 'Unknown'}</div>
          <div>Confidence: {(confidence * 100).toFixed(1)}%</div>
          <div>Game Active: {isGameActive ? 'Yes' : 'No'}</div>
          <div>Score: {userScore} - {aiScore}</div>
          <div>Choice: {Choice ? 'True' : 'False'}</div>
        </div>
      )}
    </div>
  );
}