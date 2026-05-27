import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from 'react-toastify';
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

function pickToken(data) {
  return (
    data?.accessToken ||
    data?.token ||
    data?.data?.accessToken ||
    data?.data?.token ||
    null
  );
}

function pickUser(data) {
  return data?.user || data?.data?.user || null;
}

function pickUserId(data) {
  const user = pickUser(data);
  return (
    data?.userId ||
    data?.id ||
    data?.data?.userId ||
    data?.data?.id ||
    user?.userId ||
    user?.id ||
    user?._id ||
    null
  );
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return '';

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(expiresAt));
  } catch {
    return '';
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("example@tdmu.edu.vn");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const nav = useNavigate();
  const { setSession } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const flash = JSON.parse(window.sessionStorage.getItem('auth:flash') || 'null');
      if (flash?.message) {
        toast.info(flash.message);
      }
    } catch {
      // ignore malformed flash payload
    } finally {
      window.sessionStorage.removeItem('auth:flash');
    }
  }, []);

  const canSubmit = useMemo(() => Boolean(email.trim() && password), [email, password]);


  function handleGoogleLogin() {
    if (loading) return;
    window.location.assign(authApi.getGoogleLoginUrl());
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setErr("");
    setLoading(true);

    try {
      const data = await authApi.login({ email: email.trim(), password });

      const token = pickToken(data);
      const userId = pickUserId(data);
      const user = pickUser(data) || {};

      if (!token) {
        throw new Error("Backend không trả token.");
      }

      if (!userId) {
        throw new Error("Backend không trả userId.");
      }

      const session = setSession(token, { ...user, id: userId, userId });
      const expiryText = formatExpiry(session?.expiresAt);

      toast.success(
        expiryText
          ? `Đăng nhập thành công. Token hết hạn lúc ${expiryText}.`
          : 'Đăng nhập thành công.'
      );

      nav("/feed", { replace: true });
    } catch (ex) {
      const msg =
        ex?.response?.data?.message ||
        ex?.message ||
        "Đăng nhập thất bại.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2">
        <LogIn className="h-5 w-5 text-cyan-300" />
        <h1 className="text-xl font-extrabold tracking-tight">Đăng nhập</h1>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        Dùng email sinh viên (TDMU) để truy cập sockioIT.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <div className="text-xs text-slate-300 mb-1">Email</div>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@tdmu.edu.vn"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div>
          <div className="text-xs text-slate-300 mb-1">Mật khẩu</div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {err && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {err}
          </div>
        )}

        <Button disabled={loading || !canSubmit} className="w-full">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-slate-950/20 border-t-slate-950 animate-spin" />
              <span>Đang đăng nhập...</span>
            </span>
          ) : (
            "Đăng nhập"
          )}
        </Button>

        <div className="relative py-1 text-center text-xs text-slate-500">
          <span className="relative z-10 bg-slate-950/40 px-3">hoặc</span>
          <span className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FcGoogle className="h-5 w-5" />
          Đăng nhập bằng Google
        </button>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link to="/auth/forgot" className="hover:text-slate-200">
            Quên mật khẩu?
          </Link>
          <Link to="/auth/register" className="hover:text-slate-200">
            Tạo tài khoản
          </Link>
        </div>
      </form>
    </GlassCard>
  );
}
