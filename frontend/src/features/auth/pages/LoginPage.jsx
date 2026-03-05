import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { LogIn } from "lucide-react";
import { tokenStorage } from "../../../services/tokenStorage"; // ✅ QUAN TRỌNG

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

export default function LoginPage() {
  const [email, setEmail] = useState("example@tdmu.edu.vn");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const nav = useNavigate();
  const { setSession } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });

      const token = pickToken(data);
      let userId = pickUserId(data);
      const user = pickUser(data) || {};

      if (!token) {
        throw new Error("Backend không trả token.");
      }

      if (!userId) {
        throw new Error("Backend không trả userId.");
      }

      // ✅ SỬ DỤNG tokenStorage (đúng kiến trúc)
      tokenStorage.set(token);

      // lưu userId cho ChatPage
      localStorage.setItem("userId", String(userId));

      // lưu user (tuỳ chọn)
      localStorage.setItem("user", JSON.stringify(user));

      // cập nhật auth context
      setSession(token, { ...user, id: userId, userId });

      nav("/chat");
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
          />
        </div>

        {err && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {err}
          </div>
        )}

        <Button disabled={loading} className="w-full">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

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