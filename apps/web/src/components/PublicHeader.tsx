import { Link } from "@tanstack/react-router";
import logoIcon from "../assets/logo-icon.png";

export function PublicHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <img src={logoIcon} alt="" className="h-7 w-7" />
          Growth Audit
        </Link>
      </div>
    </header>
  );
}
