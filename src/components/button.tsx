interface ButtonProps {
  type: string;
  isClicked: boolean;
  isHidden: boolean;
  onClick: () => void;
}

export default function Button({
  type,
  isClicked,
  isHidden,
  onClick,
}: ButtonProps) {
  return (
    <>
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
        className={`border-2 border-b-3 border-r-5 rounded-2xl w-full max-w-30 bg-white
          active:border-2 ${
            isClicked && "opacity-0 transition-opacity duration-1000"
          }
            ${isHidden && "hidden"}
          }`}
      >
        {type}
      </button>
    </>
  );
}
