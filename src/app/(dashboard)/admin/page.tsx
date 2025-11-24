import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { UserRow } from "@/components/admin/UserRow";
import { RoleChart, PlanChart } from "@/components/admin/Charts";
import { TrendChart } from "@/components/admin/TrendChart";
import { UsageBar } from "@/components/admin/UsageBar";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const [usersCount, projectsCount, subsCount, usageAgg] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.subscription.count(),
    prisma.usageLimit.findMany(),
  ]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { subscription: true },
  });

  const roleCounts = Object.fromEntries(
    ["FREE", "PRO", "TEAM", "ADMIN"].map((r) => [r, users.filter((u: any) => u.role === r).length])
  );
  const planCounts = Object.fromEntries(
    ["FREE", "PRO", "TEAM"].map((p) => [p, users.filter((u: any) => u.subscription?.planType === p).length])
  );

  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const dailyUsers = days.map((d) => users.filter((u: any) => {
    const ud = new Date(u.createdAt);
    ud.setHours(0,0,0,0);
    return ud.getTime() === d.getTime();
  }).length);
  const dayLabels = days.map((d) => `${d.getMonth()+1}/${d.getDate()}`);

  const topics = (usageAgg ?? []).reduce((acc: number, u: any) => acc + (u.topicGenerationsUsed ?? 0), 0);
  const frameworks = (usageAgg ?? []).reduce((acc: number, u: any) => acc + (u.frameworkGenerationsUsed ?? 0), 0);
  const reviews = (usageAgg ?? []).reduce((acc: number, u: any) => acc + (u.reviewSectionsUsed ?? 0), 0);

  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i), 1);
    d.setHours(0,0,0,0);
    return d;
  });
  const startYear = new Date();
  startYear.setMonth(startYear.getMonth() - 11, 1);
  startYear.setHours(0,0,0,0);
  const usersYear = await prisma.user.findMany({ where: { createdAt: { gte: startYear } }, select: { createdAt: true } });
  const projectsYear = await prisma.project.findMany({ where: { createdAt: { gte: startYear } }, select: { createdAt: true } });
  const monthLabels = months.map((m) => `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}`);
  const monthUsers = months.map((m) => usersYear.filter((u: any) => new Date(u.createdAt).getMonth() === m.getMonth() && new Date(u.createdAt).getFullYear() === m.getFullYear()).length);
  const monthProjects = months.map((m) => projectsYear.filter((p: any) => new Date(p.createdAt).getMonth() === m.getMonth() && new Date(p.createdAt).getFullYear() === m.getFullYear()).length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理面板</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">用户数</div>
          <div className="text-2xl font-semibold">{usersCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">项目数</div>
          <div className="text-2xl font-semibold">{projectsCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">订阅数</div>
          <div className="text-2xl font-semibold">{subsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm">角色分布</div>
          <RoleChart data={roleCounts} />
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm">订阅计划分布</div>
          <PlanChart data={planCounts} />
        </div>
      </div>

      <div className="rounded-lg border p-4 mt-6">
        <div className="mb-2 text-sm">当前月功能使用总计</div>
        <UsageBar topics={topics} frameworks={frameworks} reviews={reviews} />
      </div>

      <div className="rounded-lg border p-4 mt-6">
        <TrendChart labels={dayLabels} values={dailyUsers} title="最近14天新注册" />
        <div className="mt-4">
          <a className="text-sm underline" href="/api/admin/export/users">导出用户CSV</a>
        </div>
      </div>

      <div className="rounded-lg border p-4 mt-6 grid grid-cols-2 gap-6">
        <TrendChart labels={monthLabels} values={monthUsers} title="过去12个月注册趋势" />
        <TrendChart labels={monthLabels} values={monthProjects} title="过去12个月项目创建趋势" />
        <div>
          <a className="text-sm underline" href="/api/admin/export/projects">导出项目CSV</a>
        </div>
      </div>

      <div className="rounded-lg border mt-6">
        <div className="border-b px-4 py-3 font-medium">最近用户</div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm">
              <th className="px-3 py-2">姓名</th>
              <th className="px-3 py-2">邮箱</th>
              <th className="px-3 py-2">角色</th>
              <th className="px-3 py-2">订阅计划</th>
              <th className="px-3 py-2">订阅状态</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <UserRow key={u.id} user={{ id: u.id, email: u.email, name: u.name, role: u.role, subscription: u.subscription ? { status: u.subscription.status, planType: u.subscription.planType } : null }} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}