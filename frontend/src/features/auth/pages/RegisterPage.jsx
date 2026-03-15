import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth.api";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("Sinh viên IT");
  const [email, setEmail] = useState("example@tdmu.edu.vn");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await authApi.register({ displayName, email, password });
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
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{err}</div>}

        <Button disabled={loading} className="w-full">
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>

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
