import { useState, useEffect } from "react";

export default function Timer() {
  const [count, setCount] = useState(3);
  const [isShow, setIsShow] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsShow(false);
    setTimeout(() => {
      setIsShow(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (count > 0) {
      const countTimer = setTimeout(() => setCount(count - 1), 1250);
      return () => {
        clearTimeout(countTimer);
      };
    }

    setTimeout(() => {
      setIsShow(false);
    }, 1000);

    setTimeout(() => {
      setIsHidden(true);
    }, 3000);
  }, [count]);

  return (
    <div
      className={`text-8xl text-neutral-200 font-bold flex justify-center items-center h-full relative 
        transition-opacity duration-1000 ease-in-out z-0
        ${!isShow && "opacity-0"}
        ${isHidden && "hidden"}`}
    >
      {count > 0 ? count : "GO!"}
    </div>
  );
}
