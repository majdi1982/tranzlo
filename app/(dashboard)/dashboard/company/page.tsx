import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, CreditCard, Bell } from "lucide-react";

export default function CompanyDashboard() {
  const stats = [
    { name: "Live Jobs", value: "8", icon: Globe, color: "text-blue-500" },
    { name: "Candidates", value: "42", icon: Users, color: "text-purple-500" },
    { name: "Monthly Spend", value: "$4,120", icon: CreditCard, color: "text-green-500" },
    { name: "Unread Messages", value: "5", icon: Bell, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-muted-foreground">Monitor your translation projects and hire top talent.</p>
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

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Active Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic">No active projects to display.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
