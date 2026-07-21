const MAIN_SITE_URL = "https://www.starthinkmy.com";

export function BackToWebsiteLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={MAIN_SITE_URL}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${className}`}
    >
      <BackArrowIcon />
      Back to Website
    </a>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" aria-hidden>
      <path d="M9.5 3.5L4 8l5.5 4.5M4.5 8h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
