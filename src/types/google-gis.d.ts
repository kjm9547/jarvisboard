// Minimal type declarations for Google Identity Services (GIS) token client
interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  ux_mode?: "popup" | "redirect";
  redirect_uri?: string;
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface Google {
  accounts: {
    oauth2: {
      initTokenClient: (config: TokenClientConfig) => TokenClient;
      revoke: (token: string, callback?: () => void) => void;
    };
  };
}

declare global {
  interface Window {
    google: Google;
  }
}

export {};
