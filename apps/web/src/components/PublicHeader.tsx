import { Link } from "@tanstack/react-router";

export function PublicHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            G
          </span>
          Growth Audit
        </Link>
      </div>
    </header>
  );
}
