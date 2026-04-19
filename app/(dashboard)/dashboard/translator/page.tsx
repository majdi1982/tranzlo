import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, Star, TrendingUp } from "lucide-react";

export default function TranslatorDashboard() {
  const stats = [
    { name: "Active Jobs", value: "3", icon: Briefcase, color: "text-blue-500" },
    { name: "Completed", value: "124", icon: Star, color: "text-yellow-500" },
    { name: "Earnings (Mo)", value: "$2,450", icon: TrendingUp, color: "text-green-500" },
    { name: "Avg. Speed", value: "2.4h", icon: Clock, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Translator Dashboard</h1>
        <p className="text-muted-foreground">Manage your assignments and track your performance.</p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic">No recent assignments found.</div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Platform News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <p className="text-sm font-medium">New Language Pairs</p>
                <p className="text-xs text-muted-foreground">We now support Swahili and Icelandic!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
