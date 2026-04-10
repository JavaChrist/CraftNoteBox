import { redirect } from "next/navigation";
import DashboardChrome from "@/components/layout/DashboardChrome";
import Sidebar from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardChrome sidebar={<Sidebar />}>{children}</DashboardChrome>
  );
}
