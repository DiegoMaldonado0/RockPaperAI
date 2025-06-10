export default function Button({ type, isClicked, isHidden, onClick }) {
  return (
    <>
      <span className="w-full flex justify-center h-2/12 rounded-2xl max-w-40 bg-neutral-400 active:scale-95 ">
        <button
          type="button"
          disabled={false}
          aria-label="Click to start"
          name="startButton"
          value="start"
          id="startButton"
          onClick={onClick}
          tabIndex={0}
          role="button"
          className={`border-2 border-b-6 border-r-6 rounded-2xl w-full h-full max-w-40 bg-white active:border-2 relative -top-0.5 -left-1 active:top-0 active:left-0 transition-opacity duration-1000 z-10 ${
            isClicked ? "opacity-0" : "opacity-100"
          }
            ${isHidden && "hidden"}
          }`}
        >
          {type}
        </button>
      </span>
    </>
  );
}
