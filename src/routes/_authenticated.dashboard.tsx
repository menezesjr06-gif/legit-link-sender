import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/dashboard.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Send, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["dashboardStats"],
      queryFn: () => getDashboardStats(),
    });
  },
});

function DashboardComponent() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => getDashboardStats(),
  });

  const cards = [
    { title: "Total Campanhas", value: stats.totalCampaigns, icon: Send, color: "text-blue-600" },
    { title: "Grupos Ativos", value: stats.totalGroups, icon: Users, color: "text-purple-600" },
    { title: "Total Mensagens", value: stats.totalMessages, icon: LayoutDashboard, color: "text-gray-600" },
    { title: "Enviadas", value: stats.sentMessages, icon: CheckCircle, color: "text-green-600" },
    { title: "Pendentes", value: stats.pendingMessages, icon: Clock, color: "text-yellow-600" },
    { title: "Falhas", value: stats.failedMessages, icon: AlertCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema MJApp Link Bot</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
