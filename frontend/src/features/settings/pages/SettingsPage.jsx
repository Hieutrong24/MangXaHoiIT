import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/hooks/useAuth";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="text-xl font-extrabold tracking-tight">Cài đặt</div>
        <div className="mt-2 text-sm text-slate-300">
          Dark theme đã bật mặc định. Sau này có thể thêm lựa chọn theme & font size.
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="danger" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
