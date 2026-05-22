import { useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

const TOKEN_KEY = "yt_access_token";
const EXPIRY_KEY = "yt_token_expiry";

const loadStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) ?? 0);
  if (token && Date.now() < expiry) return token;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  return null;
};

// OAuth 리다이렉트 후 URL 해시에서 access_token 파싱
const parseHashToken = (): string | null => {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  if (!accessToken) return null;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  window.history.replaceState({}, "", window.location.pathname + window.location.search);
  return accessToken;
};

export const useYouTubeAuth = () => {
  const [token] = useState<string | null>(() => parseHashToken() ?? loadStoredToken());

  const signIn = () => {
    const redirectUri = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: SCOPES,
      prompt: "consent",
      include_granted_scopes: "true",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const signOut = () => {
    const current = localStorage.getItem(TOKEN_KEY);
    if (current) window.google?.accounts?.oauth2?.revoke(current);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    window.location.reload();
  };

  return { token, gisReady: true, isSignedIn: !!token, signIn, signOut };
};
