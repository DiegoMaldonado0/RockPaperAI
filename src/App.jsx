import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Top from "./components/top";
import Button from "./components/button";
import Card from "./components/card";
import Timer from "./components/timer";
import cardSound from "./assets/sounds/cardsound.mp3";
import flipCard from "./assets/sounds/flipcard1.mp3";
import clickSound from "./assets/sounds/click.mp3";
import "./App.css";

export default function App() {
  // UI States
  const [isClicked, setIsClicked] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [Choice, setChoice] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);

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
  const historySize = 100;
  const selectCardAudio = useRef(null);
  const aiCardAudio = useRef(null);
  const clickAudio = useRef(null);

  //Sounds
  useEffect(() => {
    clickAudio.current = new Audio(clickSound);
    clickAudio.current.preload = "auto";
    clickAudio.current.load();
  }, []);

  useEffect(() => {
    aiCardAudio.current = new Audio(flipCard);
    aiCardAudio.current.preload = "auto";
    aiCardAudio.current.load();
  }, []);

  useEffect(() => {
    selectCardAudio.current = new Audio(cardSound);
    selectCardAudio.current.preload = "auto";
    selectCardAudio.current.load();
  }, []);

  useEffect(() => {
    aiCardAudio.current.volume = 0.3;

    if (aiChoice) {
      const audio = aiCardAudio.current;
      // audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
    if (!gameOver) {
      const audio = aiCardAudio.current;
      // audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
  }, [gameOver, aiChoice]);

  useEffect(() => {
    selectCardAudio.current.volume = 0.5;

    if (currentHandSign === "rock" && !userChoice) {
      const audio = selectCardAudio.current;
      // audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
    if (currentHandSign === "paper" && !userChoice) {
      const audio = selectCardAudio.current;
      // audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
    if (currentHandSign === "scissors" && !userChoice) {
      const audio = selectCardAudio.current;
      // audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }
  }, [currentHandSign, userChoice]);

  //Handle
  const handleClick = () => {
    if (gameOver) {
      resetGame();
      return;
    }

    setIsClicked(true);
    clickAudio.current.volume = 0.1;
    clickAudio.current.play();

    setTimeout(() => {
      startGame();
      setIsHidden(true);
    }, 100);
  };

  // Game Logic
  const getWinner = (user, ai) => {
    if (user === ai) return "TIE";
    if (
      (user === "rock" && ai === "scissors") ||
      (user === "paper" && ai === "rock") ||
      (user === "scissors" && ai === "paper")
    )
      return "WIN";
    return "LOSE";
  };

  const playRound = () => {
    if (!handDetected || !currentHandSign) {
      setResult("NO");
      setIsGameActive(false);
      setChoice(false);
      setIsHidden(false);
      setIsClicked(false);
      return;
    }

    const user = currentHandSign;
    const ai = options[Math.floor(Math.random() * 3)];
    const roundResult = getWinner(user, ai);

    setUserChoice(user);
    setAiChoice(ai);
    setResult(roundResult);

    // Update scores
    if (roundResult.includes("WIN")) {
      const newUserScore = userScore + 1;
      setUserScore(newUserScore);
      if (newUserScore === 100) {
        setResult("WIN");
        setGameOver(true);
        setIsGameActive(false);
        setChoice(false);
        setIsHidden(false);
        setIsClicked(false);
        return;
      }
    } else if (roundResult.includes("LOSE")) {
      const newAiScore = aiScore + 1;
      setAiScore(newAiScore);
      if (newAiScore === 100) {
        setResult("LOSE");
        setGameOver(true);
        setIsGameActive(false);
        setChoice(false);
        setIsHidden(false);
        setIsClicked(false);
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
        setIsHidden(false);
        setIsClicked(false);
      }
    }, 3000);
  };

  const startGame = () => {
    if (gameOver) return;
    setIsGameActive(true);
    setUserChoice(null);
    setAiChoice(null);
    setResult("Preparado...");
    setTimerKey((prev) => prev + 2); // Forzar re-render del timer
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
    setIsHidden(false);
    setIsClicked(false);
    setGestureHistory([]);
    setTimerKey((prev) => prev + 2);
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
      thumb: analyzeFinger(landmarks, [1, 2, 3, 4], "thumb", isRightHand),
      index: analyzeFinger(landmarks, [5, 6, 7, 8], "index", isRightHand),
      middle: analyzeFinger(landmarks, [9, 10, 11, 12], "middle", isRightHand),
      ring: analyzeFinger(landmarks, [13, 14, 15, 16], "ring", isRightHand),
      pinky: analyzeFinger(landmarks, [17, 18, 19, 20], "pinky", isRightHand),
    };
    return fingers;
  };

  const analyzeFinger = (landmarks, joints, fingerType, isRightHand) => {
    const [base, pip, dip, tip] = joints;

    if (fingerType === "thumb") {
      return analyzeThumb(landmarks, joints, isRightHand);
    }

    const tipY = landmarks[tip].y;
    const pipY = landmarks[pip].y;
    const baseY = landmarks[base].y;

    const isExtended = tipY < pipY - 0.02 && tipY < baseY;

    const v1 = {
      x: landmarks[pip].x - landmarks[base].x,
      y: landmarks[pip].y - landmarks[base].y,
    };
    const v2 = {
      x: landmarks[tip].x - landmarks[pip].x,
      y: landmarks[tip].y - landmarks[pip].y,
    };

    const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
    const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;

    return {
      extended: isExtended,
      angle: normalizedAngle,
      confidence: Math.abs(normalizedAngle) < Math.PI / 4 ? 0.9 : 0.6,
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
      confidence: thumbToIndex > 0.05 ? 0.8 : 0.6,
    };
  };

  const calculateConfidence = (landmarks, fingerAnalysis) => {
    const avgFingerConfidence =
      Object.values(fingerAnalysis).reduce(
        (sum, finger) => sum + finger.confidence,
        0
      ) / 5;
    return Math.min(avgFingerConfidence, 0.95);
  };

  const classifyGesture = (fingerAnalysis, confidence) => {
    const extendedFingers = Object.values(fingerAnalysis).filter(
      (finger) => finger.extended
    ).length;

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
    const isRightHand = handedness === "Right";
    const fingerAnalysis = analyzeFingers(landmarks, isRightHand);
    const gestureConfidence = calculateConfidence(landmarks, fingerAnalysis);
    const gesture = classifyGesture(fingerAnalysis, gestureConfidence);

    return {
      gesture: gesture,
      confidence: gestureConfidence,
      fingerStates: fingerAnalysis,
      handedness: handedness,
    };
  };

  const stabilizeGesture = (currentGesture) => {
    const newHistory = [...gestureHistory, currentGesture];
    if (newHistory.length > historySize) {
      newHistory.shift();
    }

    setGestureHistory(newHistory);

    const counts = {};
    newHistory.forEach((g) => {
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

  return (
    <div
      id="Body"
      className="w-full h-dvh border-4 inset-shadow-sm grid grid-cols-3 grid-rows-[0.5fr_4.5fr] overflow-hidden"
    >
      <video
        ref={videoRef}
        className={`row-start-1 col-start-1 row-end-3 col-end-4 m-auto block border-4 w-full h-full object-cover insent-shadow-sm transition-opacity ${
          isVideoVisible ? "opacity-100" : "opacity-50"
        }`}
        style={{
          display: "block",
          margin: "auto",
          transform: "scaleX(-1)",
        }}
      />
      <header
        id="Header"
        className="row-start-1 col-start-1 col-end-4 flex justify-center items-center mb-0 mt-4 z-10"
      >
        <Top></Top>
      </header>
      <section
        id="ai"
        className={`col-start-2 row-start-1 flex justify-center items-center relative -top-50 transition-all duration-300 ${
          aiChoice && "translate-y-100"
        }`}
      >
        <Card type={`${aiChoice}`} animations={1}></Card>
      </section>
      <main className="row-start-2 col-start-1 col-end-4 overflow-visible sm:overflow-hidden grid grid-flow-col grid-cols-3 grid-rows-3 z-10 mt-4">
        <section
          id="you"
          className="row-start-1 row-end-4 col-start-2 grid grid-flow-col grid-cols-1 grid-rows-3"
        >
          {/* todas se escalan al perder */}
          <div
            className={`col-start-1 row-start-2 flex justify-center items-end transition-all duration-300 ease-in-out relative right-15 xs:max-md:items-end -rotate-2 z-10 ${
              userChoice
                ? userChoice === "rock" && result === "WIN"
                  ? "scale-150 -translate-y-10 z-50"
                  : userChoice === "rock" && "scale-110 -translate-y-10 z-50"
                : currentHandSign === "rock" && "scale-110 -translate-y-10 z-50"
            }`}
          >
            <Card type="rock" animations={1}></Card>
          </div>
          <div
            className={`col-start-1 row-start-2 flex justify-center items-end transition-all duration-300 ease-in-out z-20 ${
              userChoice
                ? userChoice === "paper" && result === "WIN"
                  ? "scale-150 -translate-y-10 z-50"
                  : userChoice === "paper" && "scale-110 -translate-y-10 z-50"
                : currentHandSign === "paper" &&
                  "scale-110 -translate-y-10 z-50"
            }`}
          >
            <Card type="paper" animations={1}></Card>
          </div>
          <div
            className={`col-start-1 row-start-2 flex justify-center items-end relative left-15 transition-all duration-300 ease-in-out xs:max-md:items-end rotate-2 z-30 ${
              userChoice
                ? userChoice === "scissors" && result === "WIN"
                  ? "scale-150 -translate-y-10 z-50"
                  : userChoice === "scissors" &&
                    "scale-110 -translate-y-10 z-50"
                : currentHandSign === "scissors" &&
                  "scale-110 -translate-y-10 z-50"
            }`}
          >
            <Card type="scissors" animations={1}></Card>
          </div>
        </section>
        {result === "TIE" && (
          <section
            id="result"
            className="relative col-start-2 row-start-2 z-50 font-bold text-white flex items-start justify-center text-shadow-lg/30"
          >
            <p className="text-7xl xl:text-9xl">TIE</p>
          </section>
        )}
        {result === "NO" && (
          <section
            id="result"
            className="relative col-start-2 row-start-2 z-50 font-bold text-white flex items-start justify-center text-shadow-lg/30"
          >
            <p className="text-5xl">NO HAND DETECTED</p>
          </section>
        )}
        {result === "WIN" && (
          <section
            id="result"
            className="relative col-start-2 row-start-2 z-50 font-bold text-lime-300 flex items-start justify-center text-shadow-lg/30 text-nowrap"
          >
            <p className="text-6xl xl:text-8xl">YOU WIN</p>
          </section>
        )}
        {result === "LOSE" && (
          <section
            id="result"
            className="relative col-start-2 row-start-2 z-50 font-bold text-red-300 flex items-start justify-center text-shadow-lg/30"
          >
            <p className="text-6xl xl:text-8xl text-">YOU LOSE</p>
          </section>
        )}
        {isHidden ? (
          <>
            <section
              id="indicador"
              className="relative col-start-2 row-start-1"
            >
              <div
                id="choice"
                className={`text-white text-center text-shadow-lg/30 font-bold flex justify-center items-end h-full relative transition-opacity duration-1000 ease-in-out z-0 text-nowrap text-xl xl:text-5xl`}
              >
                {!Choice
                  ? "Show your hand when the countdown ends"
                  : userChoice &&
                    aiChoice && (
                      <div>
                        <p
                          className={`${
                            result === "WIN"
                              ? "text-red-200"
                              : result === "LOSE" && "text-lime-200"
                          }
                          `}
                        >
                          {aiChoice.toUpperCase()} vs
                        </p>
                        <p
                          className={`${
                            result === "WIN"
                              ? "text-lime-200"
                              : result === "LOSE" && "text-red-200"
                          }
                          `}
                        >
                          {userChoice.toUpperCase()}
                        </p>
                      </div>
                    )}
              </div>
            </section>
            <section
              id="timer"
              className="col-start-2 row-start-1 flex justify-center items-center z-50"
            >
              <Timer
                key={timerKey}
                setChoice={setChoice}
                setIsVideoVisible={setIsVideoVisible}
              ></Timer>
            </section>
          </>
        ) : (
          <section
            id="startBoton"
            className="col-start-2 row-start-3 flex justify-center items-start relative top-10 z-0"
          >
            <Button
              isClicked={isClicked}
              isHidden={isHidden}
              onClick={handleClick}
              type={gameOver ? "RESET" : "START"}
            ></Button>
          </section>
        )}
        <section
          id="HandDetection"
          className="col-start-2 row-start-3 relative top-25 xl:top-20 flex justify-center items-start"
        >
          {handDetected && currentHandSign && (
            <div className="text-neutral-200 text-shadow-lg/30 px-3 py-2 rounded-lg w-full flex items-center justify-center font-bold gap-2">
              <div className="text-xl">
                <div>{currentHandSign.toUpperCase()}</div>
              </div>
            </div>
          )}
          {!handDetected && (
            <div className="bg-opacity-70 text-neutral-200 text-shadow-lg/30 text-center px-3 py-2 rounded-lg w-full font-bold">
              <div className="text-xl xl:text-2xl">No hand detected</div>
            </div>
          )}
        </section>
        {/* AI Section */}
        {/* <section
          id="ai"
          className="row-start-1 row-end-4 col-start-3 grid grid-flow-col grid-cols-1 grid-rows-3 relative right-2"
        >
          <div className="col-start-1 row-start-1 flex items-start justify-center text-2xl">
            <h2 className="text-neutral-300 font-bold transition-opacity duration-1000 ease-in-out z-0 md:text-4xl">
              AI
            </h2>
          </div>
          <div className="col-start-1 row-start-1 row-end-4 flex items-center justify-center">
            <h2 className="text-neutral-400 font-bold opacity-20 transition-opacity duration-1000 ease-in-out z-0 text-[50dvh] xs:text-[80dvh]">
              {aiScore}
            </h2>
          </div>
          <article
            className={`col-start-1 row-start-1 flex justify-center items-center transition-all duration-1000 ease-in-out xs:max-md:items-end rotate-4 h-full w-full ${
              aiChoice === "rock" && "scale-150"
            }`}
          >
            <Card type="Rock" animations={2}></Card>
          </article>
          <article
            className={`col-start-1 row-start-2 flex justify-center items-center transition-all duration-1000 ease-in-out -rotate-2 ${
              aiChoice === "paper" && "scale-150"
            }`}
          >
            <Card type="Paper" animations={1}></Card>
          </article>
          <article
            className={`col-start-1 row-start-3 flex justify-center items-center transition-all duration-1000 ease-in-out xs:max-md:items-start rotate-5 ${
              aiChoice === "scissors" && "scale-150"
            }`}
          >
            <Card type="Scissors" animations={2}></Card>
          </article>
        </section> */}
      </main>
      {/* Game Result Display */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-10 py-10 rounded-lg text-center">
        <div className="text-lg font-bold">{result}</div>
        {userChoice && aiChoice && (
          <div className="text-lg mt-1">
            Tú: {getHandSignEmoji(userChoice)} vs IA:{" "}
            {getHandSignEmoji(aiChoice)}
          </div>
        )}
      </div> */}

      {/* Debug panel for development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs">
          <div>Hand: {handDetected ? "Detected" : "Not detected"}</div>
          <div>Current: {currentHandSign || "None"}</div>
          <div>Handedness: {handedness || "Unknown"}</div>
          <div>Confidence: {(confidence * 100).toFixed(1)}%</div>
          <div>Game Active: {isGameActive ? "Yes" : "No"}</div>
          <div>
            Score: {userScore} - {aiScore}
          </div>
          <div>Choice: {Choice ? "True" : "False"}</div>
        </div>
      )} */}
    </div>
  );
}
