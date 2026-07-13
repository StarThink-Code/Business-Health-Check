import { Link } from "@tanstack/react-router";
import logoIcon from "../assets/logo-icon.png";

// StarThink's main site (a separate deployment) — these tabs mirror its own
// nav exactly so this tool reads as one section of the same site rather than
// a disconnected third-party page.
const MAIN_SITE_URL = "https://website-code-bik.pages.dev";

const MAIN_SITE_NAV = [
  { number: "01", label: "Home", href: `${MAIN_SITE_URL}/` },
  { number: "02", label: "About Us", href: `${MAIN_SITE_URL}/about.html` },
  { number: "03", label: "Services", href: `${MAIN_SITE_URL}/services.html` },
  { number: "04", label: "Projects", href: `${MAIN_SITE_URL}/projects.html` },
  { number: "05", label: "Articles", href: `${MAIN_SITE_URL}/articles.html` },
  { number: "06", label: "Contact", href: `${MAIN_SITE_URL}/contact.html` },
];

export function PublicHeader() {
  return (
    <header className="border-b border-white/10 bg-accent-panel">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold text-white">
          <img src={logoIcon} alt="" className="h-7 w-7" />
          Growth Audit
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {MAIN_SITE_NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-start gap-1 text-xs font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-white"
            >
              <span className="text-[10px] text-white/40">{item.number}/</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
