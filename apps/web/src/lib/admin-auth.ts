const TOKEN_KEY = "bhc_admin_token";

/** Decodes the JWT payload client-side for UX only (e.g. "that's you" labels) — never trust this for authorization. */
function decodeTokenPayload(token: string): { sub: string; email: string } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const adminAuth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  getCurrentAdminId: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? (decodeTokenPayload(token)?.sub ?? null) : null;
  },
};
