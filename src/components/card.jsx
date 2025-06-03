export default function Card({ type, animations }) {
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
      className={`border-2 w-lvw max-w-20 h-lvh max-h-30 xs:max-lg:max-w-15 xs:max-lg:max-h-20 xl:max-h-40 xl:max-w-30 flex items-center justify-center relative z-10 
    border-b-3 border-r-4 xl:border-b-4 xl:border-r-5 rounded-md shadow-2xl bg-white ${animation}
    `}
    >
      <svg
        className={
          type === "Rock"
            ? "w-10 h-10 relative top-1 left-1.5 xl:w-25 xl:h-25 xl:left-4 xl:top-3"
            : "w-10 h-10 relative -rotate-45 xl:w-20 xl:h-20"
        }
        id="rock"
        aria-label="Main logo"
      >
        <use href={`/src/assets/sprites.svg#${type}`} />
      </svg>
    </article>
  );
}
