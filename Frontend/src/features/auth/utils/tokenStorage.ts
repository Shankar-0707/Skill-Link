const ACCESS_TOKEN_KEY = "skill_link_access_token";
const REFRESH_TOKEN_KEY = "skill_link_refresh_token";
const COOKIE_MAX_AGE_DAYS = 7;

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(encodedName)) {
      return decodeURIComponent(trimmedCookie.slice(encodedName.length));
    }
  }

  return null;
}

function writeCookie(name: string, value: string, expiresAt: Date) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Expires=${expiresAt.toUTCString()}; Path=/; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Strict`;
}

function getCookieExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + COOKIE_MAX_AGE_DAYS);
  return expiresAt;
}

export function getAccessToken() {
  return readCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return readCookie(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  const expiresAt = getCookieExpiry();
  writeCookie(ACCESS_TOKEN_KEY, accessToken, expiresAt);
  writeCookie(REFRESH_TOKEN_KEY, refreshToken, expiresAt);
}

export function clearAuthTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}
