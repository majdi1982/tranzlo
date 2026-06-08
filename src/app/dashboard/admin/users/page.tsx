"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  MoreHorizontal,
  Download,
  Printer,
  FileText,
  UserCheck,
  Building,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDatabases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { cn } from "@/lib/utils";

interface ExtendedUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  registration: string;
  status: boolean;
  role: "translator" | "company";
  planTier: string;
  startDate: string;
  endDate: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = React.useState<ExtendedUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<"translator" | "company">("translator");
  const [suspendTarget, setSuspendTarget] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles);
      
      const allUsers: ExtendedUser[] = [];
      
      // Load Translators
      for (const p of profiles.documents) {
        allUsers.push({
          $id: (p.userId as string) || p.$id,
          email: (p.email as string) || "",
          name: (p.fullName as string) || "",
          emailVerification: false,
          registration: (p.createdAt as string) || "",
          status: (p.status as string) !== "suspended",
          role: "translator",
          planTier: p.planTier || "free",
          startDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A",
          endDate: p.planExpiresAt ? new Date(p.planExpiresAt).toLocaleDateString() : "Lifetime",
        });
      }

      // Load Companies
      for (const p of companyProfiles.documents) {
        allUsers.push({
          $id: (p.userId as string) || p.$id,
          email: (p.email as string) || "",
          name: (p.companyName as string) || "",
          emailVerification: false,
          registration: (p.createdAt as string) || "",
          status: (p.status as string) !== "suspended",
          role: "company",
          planTier: p.planTier || "free",
          startDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A",
          endDate: p.planExpiresAt ? new Date(p.planExpiresAt).toLocaleDateString() : "Lifetime",
        });
      }

      setUsers(allUsers);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(userId: string) {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      for (const doc of [...profiles.documents, ...companyProfiles.documents]) {
        await db.updateDocument(DB_ID, doc.$collection, doc.$id, { status: "suspended" });
      }
      setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, status: false } : u)));
      toast({ title: "User suspended" });
    } catch {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    }
    setSuspendTarget(null);
  }

  async function handleActivate(userId: string) {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      for (const doc of [...profiles.documents, ...companyProfiles.documents]) {
        await db.updateDocument(DB_ID, doc.$collection, doc.$id, { status: "active" });
      }
      setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, status: true } : u)));
      toast({ title: "User activated" });
    } catch {
      toast({ title: "Failed to activate user", variant: "destructive" });
    }
  }

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesTab = u.role === activeTab;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan =
      planFilter === "all" || u.planTier.toLowerCase() === planFilter.toLowerCase();
    
    return matchesTab && matchesSearch && matchesPlan;
  });

  // Client-Side Export Helpers
  const exportToCSV = (format: "csv" | "excel") => {
    const headers = ["Name", "Email", "Role", "Plan Tier", "Start Date", "End Date", "Status"];
    const rows = filteredUsers.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.planTier,
      u.startDate,
      u.endDate,
      u.status ? "Active" : "Suspended",
    ]);

    // Use UTF-8 BOM encoding so Excel reads Arabic correctly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ext = format === "excel" ? "csv" : "csv";
    link.setAttribute("href", url);
    link.setAttribute("download", `tranzlo_${activeTab}_users_export_${Date.now()}.${ext}`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: `Successfully exported ${activeTab} list!` });
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked! Allow pop-ups to export PDF.", variant: "destructive" });
      return;
    }
    
    const title = `Tranzlo - ${activeTab === "translator" ? "Translators" : "Companies"} Subscription Report`;
    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1f2937; }
            h1 { text-align: center; font-size: 24px; color: #0f766e; margin-bottom: 5px; }
            p.meta { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px 10px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f6; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .plan-badge { font-weight: 600; text-transform: capitalize; padding: 2px 6px; rounded: 4px; background: #e0f2fe; color: #0369a1; }
            .status-active { color: #059669; font-weight: bold; }
            .status-suspended { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="meta">Generated on: ${new Date().toLocaleString()} | Total Entries: ${filteredUsers.length}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan Tier</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers
                .map(
                  (u) => `
                <tr>
                  <td><strong>${u.name}</strong></td>
                  <td>${u.email}</td>
                  <td><span class="plan-badge">${u.planTier}</span></td>
                  <td>${u.startDate}</td>
                  <td>${u.endDate}</td>
                  <td class="${u.status ? "status-active" : "status-suspended"}">${
                    u.status ? "Active" : "Suspended"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "coupon":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "pro":
      case "plus":
      case "standard":
        return "bg-teal-500/10 text-teal-600 border-teal-500/20";
      case "free":
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage and audit system subscribers and plans</p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 rounded-xl bg-muted/60 border border-border/50 max-w-fit">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("translator")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "translator" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <UserCheck className="h-4 w-4 text-teal-500" />
            Translators
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("company")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "company" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Building className="h-4 w-4 text-teal-500" />
            Companies
          </Button>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur p-4 rounded-xl border border-border/60">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl text-xs"
            />
          </div>

          {/* Plan Tier Dropdown */}
          <div className="relative w-full sm:w-48 flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring appearance-none cursor-pointer"
            >
              <option value="all">All Plan Tiers</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="plus">Plus</option>
              <option value="pro">Pro</option>
              <option value="coupon">Coupon</option>
            </select>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportToCSV("csv")}
            className="rounded-xl gap-1.5 text-2xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportToCSV("excel")}
            className="rounded-xl gap-1.5 text-2xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportToPDF}
            className="rounded-xl gap-1.5 text-2xs font-semibold"
          >
            <Printer className="h-3.5 w-3.5" /> Print PDF
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card/25">
        <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600 animate-pulse" />
                {activeTab === "translator" ? "Linguist Accounts" : "Corporate Accounts"}
              </CardTitle>
              <CardDescription className="text-3xs">
                Showing {filteredUsers.length} of {users.filter(u => u.role === activeTab).length} entries
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="h-12 w-12 text-muted-foreground/35 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-muted-foreground">No users found</h3>
              <p className="text-2xs text-muted-foreground mt-1">Try relaxing your search query or subscription filter.</p>
            </div>
          ) : (
            <ScrollArea className="h-[55vh]">
              <div className="divide-y divide-border/20">
                {filteredUsers.map((u) => (
                  <div
                    key={u.$id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 transition-all hover:bg-muted/10"
                  >
                    {/* User Metadata */}
                    <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                      <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-600">
                        {u.role === "translator" ? <UserCheck className="h-4.5 w-4.5" /> : <Building className="h-4.5 w-4.5" />}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold truncate text-foreground">{u.name}</p>
                        <p className="text-3xs text-muted-foreground truncate font-medium">{u.email}</p>
                      </div>
                    </div>

                    {/* Subscription & Dates block */}
                    <div className="grid grid-cols-3 gap-2 md:w-1/2 text-left">
                      {/* Subscription Type */}
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={cn("rounded-lg text-4xs font-semibold px-2 py-0.5 capitalize border", getPlanBadgeColor(u.planTier))}
                        >
                          {u.planTier}
                        </Badge>
                      </div>

                      {/* Start Date */}
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Start Date</span>
                        <span className="text-xs font-medium text-foreground/90 mt-0.5">{u.startDate}</span>
                      </div>

                      {/* End Date */}
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Expiry Date</span>
                        <span className="text-xs font-medium text-foreground/90 mt-0.5">{u.endDate}</span>
                      </div>
                    </div>

                    {/* Status & Action Hub */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <Badge
                        variant={u.status ? "default" : "destructive"}
                        className="rounded-lg text-[10px] font-semibold px-2 py-0.5"
                      >
                        {u.status ? "Active" : "Suspended"}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() => router.push(`/profile?userId=${u.$id}`)}
                            className="rounded-lg text-xs"
                          >
                            <Users className="h-4 w-4 mr-2 text-teal-500" /> View Profile
                          </DropdownMenuItem>
                          {u.status ? (
                            <DropdownMenuItem
                              onClick={() => setSuspendTarget(u.$id)}
                              className="rounded-lg text-xs text-red-600 focus:text-red-700"
                            >
                              <Ban className="h-4 w-4 mr-2" /> Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivate(u.$id)}
                              className="rounded-lg text-xs text-emerald-600 focus:text-emerald-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Activate Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={() => setSuspendTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Suspend User Account</DialogTitle>
            <DialogDescription className="text-xs">
              This will suspend the user account. They will be immediately blocked from accessing their dashboard and services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSuspendTarget(null)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => suspendTarget && handleSuspend(suspendTarget)}
              className="rounded-xl text-xs"
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
