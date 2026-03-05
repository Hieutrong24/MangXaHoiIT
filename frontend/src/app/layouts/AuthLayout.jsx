import { Outlet, Link } from "react-router-dom";
import Brand from "../../shared/components/Brand";
import { motion } from "framer-motion";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-cyan-600/20 to-emerald-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(circle_at_70%_40%,rgba(6,182,212,0.25),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.20),transparent_55%)]" />
        <div className="relative p-12 h-full flex flex-col justify-between">
          <Brand />
          <div className="max-w-md">
            <div className="text-4xl font-black tracking-tight">
              Học nhanh hơn <span className="text-cyan-300">nhờ cộng đồng</span>
            </div>
            <p className="mt-4 text-slate-300">
              Chia sẻ bài viết, note môn học, luyện code, chat nhóm – tất cả trong một nơi.
            </p>
          </div>
          <div className="text-xs text-slate-400">© sockioIT • TDMU IT</div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-center">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-6 lg:hidden">
            <Brand />
          </div>
          <Outlet />
          <div className="mt-6 text-center text-xs text-slate-400">
            <Link className="hover:text-slate-200" to="/feed">
              Xem demo (cần login nếu bật bảo vệ)
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
