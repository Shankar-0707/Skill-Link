
// This file has to be changes dynamically 
// console.log(import.meta.env.VITE_ACCESS_TOKEN_KEY)
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || "skill_link_access_token";
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || "skill_link_refresh_token";
const ACCESS_TOKEN_EXPIRY_MINUTES = Number(import.meta.env.VITE_ACCESS_TOKEN_EXPIRY_MINUTES) || 15;
const REFRESH_TOKEN_EXPIRY_DAYS = Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRY_DAYS) || 7;


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
  const expiresAt2 = new Date();
  // Access token expires in minutes
  expiresAt.setMinutes(expiresAt.getMinutes() + ACCESS_TOKEN_EXPIRY_MINUTES);
  // Refresh token expires in days
  expiresAt2.setDate(expiresAt2.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return {expiresAt, expiresAt2};
}

export function getAccessToken() {
  return readCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return readCookie(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  const {expiresAt, expiresAt2} = getCookieExpiry();
  writeCookie(ACCESS_TOKEN_KEY, accessToken, expiresAt);
  writeCookie(REFRESH_TOKEN_KEY, refreshToken, expiresAt2);
}

export function clearAuthTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}
