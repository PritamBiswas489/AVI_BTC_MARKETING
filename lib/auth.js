export const AUTH_STORAGE_KEY = "voyage_logged_in";
export const AUTH_COOKIE = "voyage_auth";
export const STATIC_USERNAME = "adminmarketing123";
export const STATIC_PASSWORD = "adminmarketing123";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function isValidCredential(username, password) {
  return username === STATIC_USERNAME && password === STATIC_PASSWORD;
}

export function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${AUTH_COOKIE}=1`);
}