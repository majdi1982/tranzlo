import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { name: "Total Users", value: "1,240", icon: Users, color: "text-blue-500" },
    { name: "Verified Translators", value: "850", icon: ShieldCheck, color: "text-green-500" },
    { name: "Revenue (MTD)", value: "$12,450", icon: DollarSign, color: "text-yellow-600" },
    { name: "Pending Audits", value: "12", icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
        <p className="text-muted-foreground">Global overview and platform health monitoring.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic">No open tickets.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic">System operational. 100% uptime.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
