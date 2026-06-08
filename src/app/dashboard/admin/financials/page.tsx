"use client";

import * as React from "react";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  CheckCircle,
  HelpCircle,
  CreditCard,
  Percent,
  Search,
  Filter,
  Check,
  Loader2,
  UserPlus,
  Edit2,
  Plus,
  Users,
  Briefcase,
  Calendar,
  Settings,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services";
import { cn } from "@/lib/utils";

interface Transaction {
  $id: string;
  transactionId: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "subscription" | "job_escrow";
  planTier: string;
  amount: number;
  feeDeducted: number;
  status: "funded" | "approved" | "released" | "refunded" | "failed";
  transferStatus?: string;
  createdAt: string;
}

interface Employee {
  $id: string;
  employeeId: string;
  name: string;
  jobTitle: string;
  baseSalary: number;
  payoutAccount: string;
  paymentStatus: "paid" | "pending" | "failed";
  transferStatus?: string;
  paymentMethod: string;
  lastPayoutDate?: string;
}

export default function AdminFinancialsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [employeesLoading, setEmployeesLoading] = React.useState(true);
  const [releasingId, setReleasingId] = React.useState<string | null>(null);
  const [payingEmployeeId, setPayingEmployeeId] = React.useState<string | null>(null);
  
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"manual" | "auto" | "revenue" | "employees">("manual");

  // Withdrawal Modal state
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [withdrawEmail, setWithdrawEmail] = React.useState("");
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
  const [withdrawSpeed, setWithdrawSpeed] = React.useState<"standard" | "instant">("standard");
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);

  // Employee Pay Modal state
  const [showPayEmployeeModal, setShowPayEmployeeModal] = React.useState<Employee | null>(null);
  const [payEmployeeSpeed, setPayEmployeeSpeed] = React.useState<"standard" | "instant">("standard");

  // Employee Enrollment Modal state
  const [showEmployeeModal, setShowEmployeeModal] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  const [employeeName, setEmployeeName] = React.useState("");
  const [employeeTitle, setEmployeeTitle] = React.useState("");
  const [employeeSalary, setEmployeeSalary] = React.useState("");
  const [employeeAccount, setEmployeeAccount] = React.useState("");
  const [employeeMethod, setEmployeeMethod] = React.useState("PayPal Payouts");
  const [isSavingEmployee, setIsSavingEmployee] = React.useState(false);

  React.useEffect(() => {
    loadTransactions();
    loadEmployees();
  }, []);

  async function loadTransactions() {
    try {
      const services = getServices();
      const txs = await services.ledger.getTransactions();
      setTransactions(txs as Transaction[]);
    } catch {
      toast({ title: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const services = getServices();
      const emps = await services.ledger.getEmployees();
      setEmployees(emps as Employee[]);
    } catch {
      toast({ title: "Failed to load employee directory", variant: "destructive" });
    } finally {
      setEmployeesLoading(false);
    }
  }

  async function handleReleaseManual(txDocId: string) {
    setReleasingId(txDocId);
    try {
      const services = getServices();
      await services.ledger.releaseManualPayout(txDocId);
      
      toast({
        title: "Payout Released Successfully",
        description: "The translator's balance has been credited, and the transaction is marked as released.",
      });
      
      await loadTransactions();
    } catch {
      toast({ title: "Failed to release payout", variant: "destructive" });
    } finally {
      setReleasingId(null);
    }
  }

  async function handleWithdraw() {
    if (!withdrawEmail || !withdrawAmount) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Please enter a valid payout amount", variant: "destructive" });
      return;
    }

    setIsWithdrawing(true);
    try {
      const services = getServices();
      await services.ledger.paypalPayout(withdrawEmail, amt, withdrawSpeed);
      
      const message = withdrawSpeed === "instant" 
        ? `Successfully transferred $${amt.toFixed(2)} instantly to ${withdrawEmail} ($5.00 flat fee applied)` 
        : `Successfully scheduled standard free transfer of $${amt.toFixed(2)} to ${withdrawEmail} (1-3 days)`;
        
      toast({
        title: "PayPal Withdrawal Triggered",
        description: message,
      });
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      await loadTransactions();
    } catch {
      toast({ title: "Withdrawal failed", variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeName || !employeeTitle || !employeeSalary || !employeeAccount) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    const sal = parseFloat(employeeSalary);
    if (isNaN(sal) || sal <= 0) {
      toast({ title: "Please enter a valid salary amount", variant: "destructive" });
      return;
    }

    setIsSavingEmployee(true);
    try {
      const services = getServices();
      if (editingEmployee) {
        await services.ledger.updateEmployee(editingEmployee.$id, {
          name: employeeName,
          jobTitle: employeeTitle,
          baseSalary: sal,
          payoutAccount: employeeAccount,
          paymentMethod: employeeMethod,
        });
        toast({ title: "Employee profile updated successfully" });
      } else {
        await services.ledger.createEmployee({
          name: employeeName,
          jobTitle: employeeTitle,
          baseSalary: sal,
          payoutAccount: employeeAccount,
          paymentMethod: employeeMethod,
        });
        toast({ title: "Employee enrolled successfully" });
      }
      setShowEmployeeModal(false);
      resetEmployeeForm();
      await loadEmployees();
    } catch {
      toast({ title: "Failed to save employee profile", variant: "destructive" });
    } finally {
      setIsSavingEmployee(false);
    }
  }

  async function handlePaySalarySubmit() {
    if (!showPayEmployeeModal) return;
    const employee = showPayEmployeeModal;
    setPayingEmployeeId(employee.$id);
    setShowPayEmployeeModal(null);
    try {
      const services = getServices();
      await services.ledger.payEmployeeSalary(
        employee.$id,
        employee.employeeId,
        employee.name,
        employee.payoutAccount,
        employee.baseSalary,
        payEmployeeSpeed
      );
      
      const message = payEmployeeSpeed === "instant"
        ? `Transferred $${employee.baseSalary.toFixed(2)} instantly to ${employee.name} ($5.00 flat fee applied)`
        : `Scheduled standard free transfer of $${employee.baseSalary.toFixed(2)} to ${employee.name} (1-3 days)`;
        
      toast({
        title: "Salary Payout Dispatched",
        description: message,
      });
      await loadEmployees();
      await loadTransactions();
    } catch {
      toast({ title: "Failed to dispatch salary payout", variant: "destructive" });
    } finally {
      setPayingEmployeeId(null);
    }
  }

  function resetEmployeeForm() {
    setEditingEmployee(null);
    setEmployeeName("");
    setEmployeeTitle("");
    setEmployeeSalary("");
    setEmployeeAccount("");
    setEmployeeMethod("PayPal Payouts");
  }

  function openEditEmployee(emp: Employee) {
    setEditingEmployee(emp);
    setEmployeeName(emp.name);
    setEmployeeTitle(emp.jobTitle);
    setEmployeeSalary(emp.baseSalary.toString());
    setEmployeeAccount(emp.payoutAccount);
    setEmployeeMethod(emp.paymentMethod);
    setShowEmployeeModal(true);
  }

  // Filters
  const manualPayouts = transactions.filter(
    (t) => t.type === "job_escrow" && t.status === "approved" && t.planTier === "free"
  );

  const autoPayments = transactions.filter(
    (t) => t.type === "subscription" || (t.type === "job_escrow" && t.planTier !== "free")
  );

  const platformShare = transactions.filter(
    (t) => t.type === "job_escrow" && t.status === "released"
  );

  const getFilteredList = (list: Transaction[]) => {
    return list.filter(
      (t) =>
        t.userName.toLowerCase().includes(search.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getFilteredEmployees = () => {
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        e.payoutAccount.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getActiveList = () => {
    if (activeTab === "manual") return manualPayouts;
    if (activeTab === "auto") return autoPayments;
    return platformShare;
  };

  // Math Calculations
  const totalRevenue = platformShare.reduce((sum, t) => sum + (t.feeDeducted || 0), 0);
  const totalPayoutsReleased = platformShare.reduce((sum, t) => sum + (t.amount - (t.feeDeducted || 0)), 0);
  const totalSubscriptionsValue = autoPayments
    .filter((t) => t.type === "subscription" && t.status === "released")
    .reduce((sum, t) => sum + t.amount, 0);

  // Admin personal earnings = subscription fees + platform share commission
  const adminPersonalEarnings = totalRevenue + totalSubscriptionsValue;

  // CSV/Excel instant export
  const exportToCSV = () => {
    if (activeTab === "employees") {
      const headers = ["Employee ID", "Full Name", "Job Title", "Monthly Salary", "Payout Account", "Status", "Transfer Status", "Payment Method", "Last Payout Date"];
      const rows = getFilteredEmployees().map((e) => [
        e.employeeId,
        `"${e.name.replace(/"/g, '""')}"`,
        e.jobTitle,
        e.baseSalary.toFixed(2),
        e.payoutAccount,
        e.paymentStatus,
        e.transferStatus || "pending",
        e.paymentMethod,
        e.lastPayoutDate ? new Date(e.lastPayoutDate).toLocaleDateString() : "Never",
      ]);
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      downloadFile(csvContent, "employee_payroll");
      return;
    }

    const list = getFilteredList(getActiveList());
    const headers = ["Transaction ID", "Code / Ledger Ref", "Customer Name", "Customer Email", "Plan Tier", "Type", "Amount", "Fee Deducted", "Net Released", "Status", "Transfer Status", "Date"];
    const rows = list.map((t) => [
      t.transactionId,
      t.code,
      `"${t.userName.replace(/"/g, '""')}"`,
      t.userEmail,
      t.planTier,
      t.type,
      t.amount.toFixed(2),
      t.feeDeducted.toFixed(2),
      (t.amount - t.feeDeducted).toFixed(2),
      t.status,
      t.transferStatus || "succeeded",
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    downloadFile(csvContent, `financial_${activeTab}`);
  };

  const downloadFile = (content: string, prefix: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tranzlo_${prefix}_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: `Exported ${prefix} data successfully!` });
  };

  const exportToPDF = () => {
    if (activeTab === "employees") {
      const list = getFilteredEmployees();
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const html = `
        <html>
          <head>
            <title>Tranzlo Employee Payroll Report</title>
            <style>
              body { font-family: sans-serif; padding: 30px; color: #1f2937; }
              h1 { text-align: center; color: #0f766e; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 11px; }
              th { background-color: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>Tranzlo Employee Payroll Report</h1>
            <p>Generated: ${new Date().toLocaleString()} | Total Count: ${list.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Job Title</th>
                  <th>Salary ($)</th>
                  <th>Payout Account</th>
                  <th>Status</th>
                  <th>Transfer Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(e => `
                  <tr>
                    <td>${e.employeeId}</td>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.jobTitle}</td>
                    <td>$${e.baseSalary.toFixed(2)}</td>
                    <td>${e.payoutAccount}</td>
                    <td>${e.paymentStatus.toUpperCase()}</td>
                    <td>${(e.transferStatus || "pending").toUpperCase()}</td>
                    <td>${e.paymentMethod}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    }

    const list = getFilteredList(getActiveList());
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked! Allow pop-ups to print reports.", variant: "destructive" });
      return;
    }

    const title = `Tranzlo Financial Report - ${
      activeTab === "manual" ? "Pending Payouts" : activeTab === "auto" ? "Automated Ledger" : "Platform Revenue Share"
    }`;

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1f2937; }
            h1 { text-align: center; font-size: 22px; color: #0f766e; margin-bottom: 5px; }
            p.meta { text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px 10px; text-align: left; font-size: 10px; }
            th { background-color: #f3f4f6; font-weight: 700; color: #374151; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .amount { font-weight: bold; }
            .fee { color: #b91c1c; }
            .net { color: #047857; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="meta">Date generated: ${new Date().toLocaleString()} | Entries Count: ${list.length}</p>
          <table>
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Gross ($)</th>
                <th>Fee ($)</th>
                <th>Net ($)</th>
                <th>Status</th>
                <th>Transfer Status</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map(
                  (t) => `
                <tr>
                  <td>${t.transactionId}</td>
                  <td><code>${t.code}</code></td>
                  <td><strong>${t.userName}</strong></td>
                  <td>${t.userEmail}</td>
                  <td>${t.planTier.toUpperCase()}</td>
                  <td class="amount">$${t.amount.toFixed(2)}</td>
                  <td class="fee">-$${t.feeDeducted.toFixed(2)}</td>
                  <td class="net">$${(t.amount - t.feeDeducted).toFixed(2)}</td>
                  <td>${t.status.toUpperCase()}</td>
                  <td>${(t.transferStatus || "succeeded").toUpperCase()}</td>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "released":
      case "paid":
      case "succeeded":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "approved":
      case "pending":
      case "processing":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "funded":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Ledger</h1>
          <p className="text-sm text-muted-foreground">Monitor transaction metrics, approve payouts, and audit commission structures</p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap p-1 rounded-xl bg-muted/60 border border-border/50 max-w-fit gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("manual")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "manual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <CreditCard className="h-4 w-4 text-teal-600" />
            Manual Payouts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("auto")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "auto" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <CheckCircle className="h-4 w-4 text-teal-600" />
            Auto Payments
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("revenue")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "revenue" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Percent className="h-4 w-4 text-teal-600" />
            Platform Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("employees")}
            className={cn(
              "rounded-lg gap-2 text-xs font-semibold px-4 py-2 transition-all",
              activeTab === "employees" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Users className="h-4 w-4 text-teal-600" />
            Employee Salaries
          </Button>
        </div>
      </div>

      {/* Summary Widgets Block */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Admin Personal Profit Widget */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-teal-500/20 transition-all duration-300 bg-teal-950/5">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">Admin Personal Profits</span>
                <span className="text-2xl font-extrabold text-teal-600 tracking-tight">${adminPersonalEarnings.toFixed(2)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                <TrendingUp className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowWithdrawModal(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-3xs font-bold py-1 px-2 rounded-lg gap-1.5 transition-all shadow-md"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Withdraw Payout
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-teal-500/20 transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between h-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Platform Revenue Share</span>
              <span className="text-2xl font-extrabold text-foreground tracking-tight">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-teal-500/20 transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between h-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Net Translation Payouts</span>
              <span className="text-2xl font-extrabold text-foreground tracking-tight">${totalPayoutsReleased.toFixed(2)}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-teal-500/20 transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between h-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Subscribers Value</span>
              <span className="text-2xl font-extrabold text-foreground tracking-tight">${totalSubscriptionsValue.toFixed(2)}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter, Search, and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur p-4 rounded-xl border border-border/60">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "employees" ? "Search employees..." : "Search transactions..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          {activeTab === "employees" && (
            <Button
              size="sm"
              onClick={() => {
                resetEmployeeForm();
                setShowEmployeeModal(true);
              }}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-2xs font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5" /> Enroll Employee
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCSV}
            className="rounded-xl gap-1.5 text-2xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
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

      {/* Main Panel View */}
      {activeTab === "employees" ? (
        <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card/25">
          <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Employee Payroll Scheduler
            </CardTitle>
            <CardDescription className="text-3xs">
              Manage salary rates, payout methods, and run scheduled payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {employeesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : getFilteredEmployees().length === 0 ? (
              <div className="py-20 text-center">
                <Users className="h-12 w-12 text-muted-foreground/35 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-muted-foreground">No employees found</h3>
                <p className="text-2xs text-muted-foreground mt-1">Enroll your first employee to start payroll schedules.</p>
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="divide-y divide-border/20">
                  {getFilteredEmployees().map((emp) => (
                    <div
                      key={emp.$id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 transition-all hover:bg-muted/10"
                    >
                      <div className="flex items-center gap-3 lg:w-1/4">
                        <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-600">
                          <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.jobTitle}</p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:w-1/5">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Salary Rate</span>
                        <span className="text-xs font-extrabold text-foreground">${emp.baseSalary.toFixed(2)}/mo</span>
                      </div>

                      <div className="flex flex-col lg:w-1/4">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Payout Account</span>
                        <span className="text-xs font-mono text-foreground/80 truncate">{emp.payoutAccount}</span>
                        <span className="text-[9px] text-muted-foreground">{emp.paymentMethod}</span>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        {/* Transfer Status Badge */}
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-muted-foreground font-semibold uppercase block mb-0.5">Transfer Status</span>
                          <Badge
                            variant="outline"
                            className={cn("rounded-lg text-4xs font-semibold px-2 py-0.5 border capitalize", getStatusBadge(emp.transferStatus || "pending"))}
                          >
                            {emp.transferStatus || "pending"}
                          </Badge>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn("rounded-lg text-4xs font-semibold px-2 py-0.5 border capitalize", getStatusBadge(emp.paymentStatus))}
                        >
                          {emp.paymentStatus}
                        </Badge>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditEmployee(emp)}
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowPayEmployeeModal(emp)}
                            disabled={payingEmployeeId === emp.$id || emp.paymentStatus === "paid"}
                            className="rounded-xl px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-3xs font-bold gap-1 shadow-md"
                          >
                            {payingEmployeeId === emp.$id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Pay Salary
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card/25">
          <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              {activeTab === "manual"
                ? "Pending Manual Payout Releases"
                : activeTab === "auto"
                ? "Automated Payments Ledger"
                : "Platform Fee Revenue Breakdown"}
            </CardTitle>
            <CardDescription className="text-3xs">
              Showing {getFilteredList(getActiveList()).length} entries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : getFilteredList(getActiveList()).length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/35 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-muted-foreground">No records found</h3>
                <p className="text-2xs text-muted-foreground mt-1">No transactions fit the current parameters.</p>
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="divide-y divide-border/20">
                  {getFilteredList(getActiveList()).map((t) => {
                    const netReleased = t.amount - (t.feeDeducted || 0);
                    const isPendingRelease = t.type === "job_escrow" && t.status === "approved";

                    return (
                      <div
                        key={t.$id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 transition-all hover:bg-muted/10"
                      >
                        <div className="flex items-center gap-3 lg:w-1/4">
                          <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-600">
                            <CreditCard className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-bold text-foreground font-mono truncate">{t.transactionId}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-mono">{t.code}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center lg:w-1/5">
                          <p className="text-xs font-bold text-foreground">{t.userName}</p>
                          <p className="text-[10px] text-muted-foreground">{t.userEmail}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 lg:w-1/4 text-left">
                          <div>
                            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Amt</span>
                            <span className="text-xs font-bold text-foreground/90 block mt-0.5">${t.amount.toFixed(2)}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-red-500 font-semibold uppercase tracking-wider">Fee Cut</span>
                            <span className="text-xs font-medium text-red-600 block mt-0.5">-${t.feeDeducted.toFixed(2)}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Net share</span>
                            <span className="text-xs font-bold text-emerald-600 block mt-0.5">${netReleased.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                          {/* Transfer Status Badge */}
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-muted-foreground font-semibold uppercase block mb-0.5">Transfer Status</span>
                            <Badge
                              variant="outline"
                              className={cn("rounded-lg text-4xs font-semibold px-2 py-0.5 border capitalize", getStatusBadge(t.transferStatus || "succeeded"))}
                            >
                              {t.transferStatus || "succeeded"}
                            </Badge>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn("rounded-lg text-4xs font-semibold px-2 py-0.5 border capitalize", getStatusBadge(t.status))}
                          >
                            {t.status}
                          </Badge>

                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>

                          {activeTab === "manual" && isPendingRelease && (
                            <Button
                              size="sm"
                              onClick={() => handleReleaseManual(t.$id)}
                              disabled={releasingId === t.$id}
                              className="rounded-xl px-4 py-1.5 h-8 bg-teal-600 hover:bg-teal-700 text-white text-3xs font-bold gap-1 shadow-md transition-all shrink-0"
                            >
                              {releasingId === t.$id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Release
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: Admin Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border/80 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/20">
              <h3 className="text-lg font-bold text-foreground">Withdraw Personal Profits</h3>
              <p className="text-xs text-muted-foreground mt-1">Initiate a secure transfer from platform balances directly to your personal Card/PayPal account.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">PayPal Payout Account (Email)</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={withdrawEmail}
                  onChange={(e) => setWithdrawEmail(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Amount to Payout ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <span className="text-3xs text-muted-foreground block">Max withdrawable: ${adminPersonalEarnings.toFixed(2)}</span>
              </div>
              
              {/* Transfer Speed Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Transfer Speed Option</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setWithdrawSpeed("standard")}
                    className={cn(
                      "p-3 rounded-xl border border-border/70 cursor-pointer text-left transition-all hover:border-teal-500",
                      withdrawSpeed === "standard" ? "border-teal-600 bg-teal-500/5 ring-1 ring-teal-500" : ""
                    )}
                  >
                    <p className="text-xs font-bold">Standard</p>
                    <p className="text-4xs text-muted-foreground mt-0.5">Free transfer</p>
                    <p className="text-3xs text-teal-600 font-semibold mt-1">1-3 business days</p>
                  </div>
                  <div
                    onClick={() => setWithdrawSpeed("instant")}
                    className={cn(
                      "p-3 rounded-xl border border-border/70 cursor-pointer text-left transition-all hover:border-teal-500",
                      withdrawSpeed === "instant" ? "border-teal-600 bg-teal-500/5 ring-1 ring-teal-500" : ""
                    )}
                  >
                    <p className="text-xs font-bold">Instant (Momentary)</p>
                    <p className="text-4xs text-muted-foreground mt-0.5">Deducts flat $5.00 fee</p>
                    <p className="text-3xs text-teal-600 font-semibold mt-1">Transferred in minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/20 bg-muted/10 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-xl text-2xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-2xs font-semibold gap-1.5"
              >
                {isWithdrawing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Payout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveEmployee}
            className="bg-background border border-border/80 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b border-border/20">
              <h3 className="text-lg font-bold text-foreground">
                {editingEmployee ? "Edit Employee Profile" : "Enroll New Employee"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure employee roles, base salary rates, and routing values.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Job Title</label>
                  <Input
                    placeholder="Project Manager"
                    value={employeeTitle}
                    onChange={(e) => setEmployeeTitle(e.target.value)}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Monthly Salary ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={employeeSalary}
                    onChange={(e) => setEmployeeSalary(e.target.value)}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Payout Target Account (Email/Phone)</label>
                <Input
                  placeholder="payout@example.com"
                  value={employeeAccount}
                  onChange={(e) => setEmployeeAccount(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Payment Channel</label>
                <select
                  value={employeeMethod}
                  onChange={(e) => setEmployeeMethod(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="PayPal Payouts">PayPal Payouts</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Direct Debit Card">Direct Debit Card</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-border/20 bg-muted/10 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEmployeeModal(false)}
                className="rounded-xl text-2xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEmployee}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-2xs font-semibold gap-1.5"
              >
                {isSavingEmployee && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editingEmployee ? "Update Record" : "Enroll Profile"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Pay Employee Salary Modal */}
      {showPayEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border/80 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/20">
              <h3 className="text-lg font-bold text-foreground">Dispatch Employee Payout</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You are about to transfer salary dues of <strong>${showPayEmployeeModal.baseSalary.toFixed(2)}</strong> to <strong>{showPayEmployeeModal.name}</strong>.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Routing Speed Option</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPayEmployeeSpeed("standard")}
                    className={cn(
                      "p-3 rounded-xl border border-border/70 cursor-pointer text-left transition-all hover:border-teal-500",
                      payEmployeeSpeed === "standard" ? "border-teal-600 bg-teal-500/5 ring-1 ring-teal-500" : ""
                    )}
                  >
                    <p className="text-xs font-bold">Standard</p>
                    <p className="text-4xs text-muted-foreground mt-0.5">Free transfer</p>
                    <p className="text-3xs text-teal-600 font-semibold mt-1">1-3 business days</p>
                  </div>
                  <div
                    onClick={() => setPayEmployeeSpeed("instant")}
                    className={cn(
                      "p-3 rounded-xl border border-border/70 cursor-pointer text-left transition-all hover:border-teal-500",
                      payEmployeeSpeed === "instant" ? "border-teal-600 bg-teal-500/5 ring-1 ring-teal-500" : ""
                    )}
                  >
                    <p className="text-xs font-bold">Instant (Momentary)</p>
                    <p className="text-4xs text-muted-foreground mt-0.5">Deducts flat $5.00 fee</p>
                    <p className="text-3xs text-teal-600 font-semibold mt-1">Transferred in minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/20 bg-muted/10 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPayEmployeeModal(null)}
                className="rounded-xl text-2xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePaySalarySubmit}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-2xs font-semibold"
              >
                Approve & Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
