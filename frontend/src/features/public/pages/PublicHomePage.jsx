import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Code2,
  FileText,
  LockKeyhole,
  MessageCircle,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Brand from "../../../shared/components/Brand";
import Button from "../../../shared/components/Button";
import GlassCard from "../../../shared/components/GlassCard";
import { useAuth } from "../../auth/hooks/useAuth";

function cx(...parts) {
  return parts.flat().filter(Boolean).join(" ");
}

const featureCards = [
  {
    title: "Bảng tin học tập",
    desc: "Theo dõi bài viết, ghi chú, tài liệu và chia sẻ kinh nghiệm học CNTT trong cộng đồng.",
    icon: FileText,
    action: "Xem bảng tin",
    to: "/feed",
  },
  {
    title: "Viết bài chia sẻ",
    desc: "Đăng bài học, tài liệu, hướng dẫn, câu hỏi hoặc kinh nghiệm làm project cho bạn bè cùng xem.",
    icon: PenLine,
    action: "Tạo bài viết",
    to: "/posts/new",
  },
  {
    title: "Chat nhóm học tập",
    desc: "Trao đổi trực tiếp với bạn học, tạo nhóm, gửi tin nhắn và hỗ trợ nhau khi làm bài.",
    icon: MessageCircle,
    action: "Mở chat",
    to: "/chat",
  },
  {
    title: "Luyện code",
    desc: "Học theo lộ trình, làm bài lập trình, kiểm tra kết quả nộp bài và theo dõi tiến độ.",
    icon: Code2,
    action: "Vào khu luyện code",
    to: "/code/learn",
  },
];

const publicStats = [
  { value: "Public", label: "Cho phép xem giới thiệu khi chưa đăng nhập" },
  { value: "Protected", label: "Khóa các chức năng cần tài khoản" },
  { value: "TDMU IT", label: "Không gian chia sẻ kiến thức CNTT" },
];

export default function PublicHomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function requireLogin(featureName, path = "/feed") {
    if (isAuthenticated) {
      navigate(path);
      return;
    }

    toast.info(`Bạn cần đăng nhập để sử dụng chức năng ${featureName}.`);
    navigate("/auth/login");
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Trang chủ sockioIT">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white" href="#gioi-thieu">
              Giới thiệu
            </a>
            <a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white" href="#tinh-nang">
              Tính năng
            </a>
            <a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white" href="#quyen-truy-cap">
              Quyền truy cập
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button type="button" onClick={() => navigate("/feed")} className="min-h-[40px] px-4">
                Vào trang chủ
              </Button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="hidden min-h-[40px] items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] sm:inline-flex"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex min-h-[40px] items-center rounded-xl border border-cyan-400/20 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_10px_24px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section id="gioi-thieu" className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.03fr_0.97fr]">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Trang công khai dành cho người chưa đăng nhập
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Khám phá cộng đồng học tập <span className="text-cyan-300">sockioIT</span> trước khi đăng nhập.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Người dùng chưa có tài khoản có thể xem phần giới thiệu, tính năng và quy định truy cập. Khi bấm vào các chức năng như chat, đăng bài, luyện code hoặc bảng tin, hệ thống sẽ yêu cầu đăng nhập trước.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={() => requireLogin("Bảng tin học tập", "/feed")} className="min-h-[48px] px-6">
                  Trải nghiệm trang chủ
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => requireLogin("Tìm kiếm bài viết", "/search")}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <Search className="h-4 w-4" />
                  Tìm kiếm nội dung
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {publicStats.map((item) => (
                  <div key={item.value} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                    <div className="text-lg font-extrabold text-white">{item.value}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="relative"
            >
              <GlassCard className="overflow-hidden p-4 sm:p-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="text-sm font-bold text-white">Bản xem trước</div>
                      <div className="text-xs text-slate-400">Chỉ xem giới thiệu khi chưa đăng nhập</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Cần đăng nhập
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {featureCards.slice(0, 3).map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => requireLogin(item.title, item.to)}
                          className={cx(
                            "group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10",
                            index === 0 && "ring-1 ring-cyan-400/10"
                          )}
                        >
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-white">{item.title}</span>
                            <span className="block truncate text-xs text-slate-400">{item.action}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        <section id="tinh-nang" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Tính năng chính</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Các chức năng sẽ mở sau khi đăng nhập</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Trang public chỉ đóng vai trò giới thiệu. Mọi thao tác ảnh hưởng đến dữ liệu cá nhân, bài viết, chat hoặc luyện code đều được bảo vệ bằng đăng nhập.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <GlassCard key={item.title} className="flex min-h-[260px] flex-col p-5 transition hover:-translate-y-1 hover:border-cyan-400/25">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-white">{item.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{item.desc}</p>
                    <button
                      type="button"
                      onClick={() => requireLogin(item.title, item.to)}
                      className="mt-5 inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      {item.action}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </section>

        <section id="quyen-truy-cap" className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <GlassCard className="grid gap-6 overflow-hidden p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Phân quyền rõ ràng
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-white">Public Page và Protected Page được tách riêng.</h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Người dùng chưa đăng nhập chỉ xem được trang công khai. Sau khi đăng nhập thành công, hệ thống điều hướng về trang chủ bảng tin để bắt đầu sử dụng đầy đủ tính năng.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/auth/register"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/90 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    Tạo tài khoản mới
                  </Link>
                  <Link
                    to="/auth/login"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <BookOpenCheck className="h-5 w-5 text-cyan-300" />
                    <div className="text-sm font-extrabold text-white">Được xem công khai</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Giới thiệu nền tảng, tính năng, định hướng sử dụng và nút đăng nhập/đăng ký.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <LockKeyhole className="h-5 w-5 text-amber-300" />
                    <div className="text-sm font-extrabold text-white">Cần đăng nhập</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Bảng tin, tạo bài viết, chat, cộng đồng, luyện code, thông báo, hồ sơ và cài đặt tài khoản.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-violet-300" />
                    <div className="text-sm font-extrabold text-white">Sau đăng nhập</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Điều hướng về trang chủ <span className="font-semibold text-slate-200">/feed</span>, không tự chuyển sang trang chat.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
          <div>© sockioIT • Không gian học tập CNTT TDMU</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-slate-300" href="#gioi-thieu">Giới thiệu</a>
            <a className="hover:text-slate-300" href="#tinh-nang">Tính năng</a>
            <Link className="hover:text-slate-300" to="/auth/login">Đăng nhập</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
