import { useState, useEffect, useRef } from "react";

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

export const useYouTubeAuth = () => {
  const [token, setToken] = useState<string | null>(loadStoredToken);
  const [gisReady, setGisReady] = useState(false);
  const clientRef = useRef<TokenClient | null>(null);

  useEffect(() => {
    const setup = () => {
      if (!CLIENT_ID || !window.google?.accounts?.oauth2) return;
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: TokenResponse) => {
          if (response.error || !response.access_token) return;
          const expiry = Date.now() + (response.expires_in ?? 3600) * 1000;
          localStorage.setItem(TOKEN_KEY, response.access_token);
          localStorage.setItem(EXPIRY_KEY, String(expiry));
          setToken(response.access_token);
        },
      });
      setGisReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      setup();
    } else {
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="accounts.google.com/gsi/client"]'
      );
      if (!script) return;
      script.addEventListener("load", setup, { once: true });
    }
  }, []);

  const signIn = () => {
    if (!clientRef.current) return;
    // 이미 동의한 경우 팝업 없이 조용히 토큰 재발급, 미동의 시 계정 선택 팝업
    clientRef.current.requestAccessToken({ prompt: "" });
  };

  const signOut = () => {
    const current = localStorage.getItem(TOKEN_KEY);
    if (current) window.google?.accounts?.oauth2?.revoke(current);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setToken(null);
  };

  return { token, gisReady, isSignedIn: !!token, signIn, signOut };
};
