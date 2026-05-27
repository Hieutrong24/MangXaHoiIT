import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth.api";
import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("Sinh viên IT");
  const [email, setEmail] = useState("example@tdmu.edu.vn");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  function handleGoogleLogin() {
    if (loading) return;
    window.location.assign(authApi.getGoogleLoginUrl());
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!displayName.trim() || !email.trim() || !password) {
      setErr("Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ displayName: displayName.trim(), email: email.trim(), password });
      toast.success("Đăng ký thành công. Vui lòng đăng nhập để vào trang chủ.");
      nav("/auth/login");
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-emerald-300" />
        <h1 className="text-xl font-extrabold tracking-tight">Tạo tài khoản</h1>
      </div>
      <p className="mt-2 text-sm text-slate-300">Bắt đầu chia sẻ note, bài viết, và luyện code cùng cộng đồng.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <div className="text-xs text-slate-300 mb-1">Tên hiển thị</div>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-slate-300 mb-1">Email TDMU</div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-slate-300 mb-1">Mật khẩu</div>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>

        <div>
          <div className="text-xs text-slate-300 mb-1">Xác nhận mật khẩu</div>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>

        {err && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{err}</div>}

        <Button disabled={loading} className="w-full">
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
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
          Đăng ký / đăng nhập bằng Google
        </button>

        <div className="text-xs text-slate-400 text-center">
          Đã có tài khoản?{" "}
          <Link to="/auth/login" className="hover:text-slate-200">
            Đăng nhập
          </Link>
        </div>
      </form>
    </GlassCard>
  );
}
