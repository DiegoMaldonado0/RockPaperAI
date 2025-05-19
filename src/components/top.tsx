export default function Top() {
  return (
    <>
      <nav
        className="border-3 shadow-md w-9/12 h-7 max-w-200 
        relative grid grid-flow-row grid-cols-3 grid-rows-1 items-center"
      >
        <a
          href="https://www.genpact.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link description"
          className="flex items-center 
            absolute 
            top-0 left-5"
        >
          <svg
            className="w-7 h-7 
              hover:scale-110 hover:filter hover:drop-shadow-lg 
              transition-transform duration-250"
            id="logo"
            role="logo"
            aria-label="Main logo"
          >
            <use href="/src/assets/sprites.svg#Rock" />
          </svg>
        </a>
        <a
          href="https://www.genpact.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link description"
          className="col-start-2"
        >
          <h1
            id="header"
            className="text-2xl 2xl:text-4xl font-roboto text-center tracking-tighter"
            role="banner"
            aria-label="Main header"
          >
            RockPaperAI
          </h1>
        </a>
      </nav>
    </>
  );
}
