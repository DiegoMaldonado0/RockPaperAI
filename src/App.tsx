import "./app.css";
import { useState } from "react";
import Top from "./components/top";
import Card from "./components/card";
import Button from "./components/button";
import Timer from "./components/timer";
import User from "./components/user";

function App() {
  const [isClicked, setIsClicked] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

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
        </section>
        {isHidden ? (
          <section
            id="timer"
            className="col-start-2 row-start-3 flex justify-center items-center z-0"
          >
            <Timer></Timer>
          </section>
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
        </section>
        <section
          id="userCamera"
          className="col-start-2 row-start-2 flex justify-center mb-1"
        >
          <User></User>
        </section>
      </main>
    </div>
  );
}

export default App;
