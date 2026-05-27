import { useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "../../../shared/components/Spinner";
import { useAuth } from "../hooks/useAuth";

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(
    Array.from(window.atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );
}

function readPayloadFromLocation() {
  if (typeof window === "undefined") return null;

  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const rawSearch = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
  const params = new URLSearchParams(rawSearch || rawHash);

  const encodedPayload = params.get("payload");
  if (encodedPayload) {
    try {
      return JSON.parse(decodeBase64Url(encodedPayload));
    } catch {
      return { error: "Google login payload is invalid." };
    }
  }

  const accessToken = params.get("accessToken") || params.get("token");
  const userRaw = params.get("user");
  const error = params.get("error");

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { accessToken, user, error };
}

export default function GoogleCallbackPage() {
  const { setSession } = useAuth();

  useEffect(() => {
    const payload = readPayloadFromLocation();

    if (payload?.error) {
      window.sessionStorage.setItem(
        "auth:flash",
        JSON.stringify({ type: "error", message: payload.error })
      );
      window.location.replace("/auth/login");
      return;
    }

    if (!payload?.accessToken || !payload?.user?.userId) {
      window.sessionStorage.setItem(
        "auth:flash",
        JSON.stringify({
          type: "error",
          message: "Google login did not return enough session information.",
        })
      );
      window.location.replace("/auth/login");
      return;
    }

    setSession(payload.accessToken, payload.user);
    toast.success("Google login successful.");
    window.location.replace("/feed");
  }, [setSession]);

  return <Spinner label="Finishing Google login..." />;
}
