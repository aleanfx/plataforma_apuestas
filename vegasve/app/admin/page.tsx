import { AuthGuard } from "@/components/auth-guard";
import { AdminShell } from "@/components/admin-shell";

export default function AdminPage() {
  return (
    <AuthGuard admin>
      <AdminShell />
    </AuthGuard>
  );
}
