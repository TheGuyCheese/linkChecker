export default function NavBar() {
  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">link</span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            LinkChecker
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
