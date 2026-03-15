import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-violet-300" />
        <h1 className="text-xl font-extrabold tracking-tight">Quên mật khẩu</h1>
      </div>
      <p className="mt-2 text-sm text-slate-300">Nhập email để nhận hướng dẫn khôi phục.</p>

      {!done ? (
        <div className="mt-6 space-y-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@tdmu.edu.vn" />
          <Button className="w-full" onClick={() => setDone(true)}>
            Gửi hướng dẫn
          </Button>
        </div>
      ) : (
        <div className="mt-6 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          Nếu email tồn tại, bạn sẽ nhận được hướng dẫn trong vài phút.
        </div>
      )}

      <div className="mt-6 text-xs text-slate-400 text-center">
        <Link className="hover:text-slate-200" to="/auth/login">
          Quay lại đăng nhập
        </Link>
      </div>
    </GlassCard>
  );
}
