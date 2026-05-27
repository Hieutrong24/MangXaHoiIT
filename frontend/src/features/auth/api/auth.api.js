import { http } from "../../../services/http";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
const googleRedirectUri =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${normalizedApiBaseUrl}/auth/google/callback`;
const googleScope = "openid email profile";

function buildGoogleOauthUrl() {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", googleScope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export const authApi = {
  async login(payload) {
    const res = await http.post("/auth/login", payload);
    return res.data;
  },
  async register(payload) {
    const res = await http.post("/auth/register", payload);
    return res.data;
  },
  getGoogleLoginUrl() {
    if (googleAuthUrl) {
      return googleAuthUrl;
    }

    if (googleClientId) {
      return buildGoogleOauthUrl();
    }

    return `${normalizedApiBaseUrl}/auth/google`;
  },
};
