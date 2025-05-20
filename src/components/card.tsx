interface CardProps {
  type: string;
  animations: number;
}

export default function Card({ type, animations }: CardProps) {
  let animation;

  switch (animations) {
    case 1:
      animation = "animate-wiggle1";
      break;
    case 2:
      animation = "animate-wiggle2";
      break;
    case 3:
      animation = "animate-wiggle3";
      break;
    default:
      break;
  }

  return (
    <article
      className={`border-2 w-lvw max-w-15 h-lvh max-h-15 flex items-center justify-center relative z-10 
    border-b-3 border-r-4 rounded-md shadow-2xl ${animation}
    `}
    >
      <svg
        className={
          type === "Rock"
            ? "w-10 h-10 relative top-1 left-1.5"
            : "w-10 h-10 relative -rotate-45"
        }
        id="rock"
        aria-label="Main logo"
      >
        <use href={`/src/assets/sprites.svg#${type}`} />
      </svg>
    </article>
  );
}
