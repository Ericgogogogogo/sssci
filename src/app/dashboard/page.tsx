import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <p className="text-zinc-600 dark:text-zinc-400">欢迎回来，{session.user?.name ?? session.user?.email}！</p>
    </div>
  );
}