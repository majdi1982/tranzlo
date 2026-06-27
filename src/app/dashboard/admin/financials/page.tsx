"use client";

import * as React from "react";
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Invoice, LedgerEntry } from "@/types/finance";
import { Input } from "@/components/ui/input";
import { InvoiceViewer } from "@/components/finance/invoice-viewer";

export default function AdminFinancialsPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [transactions, setTransactions] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  const [escrows, setEscrows] = React.useState<(LedgerEntry & { translatorId?: string; earlyReleaseRequested?: boolean; applicationId?: string })[]>([]);
  const [payoutEmails, setPayoutEmails] = React.useState<Record<string, string>>({});
  const [releasingId, setReleasingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    setLoading(true);
    try {
      const services = getServices();
      
      const allInvoices = await services.ledger.getInvoicesByUser(""); 
      const allTransactions = await services.ledger.getTransactionsByUser(""); 
      setInvoices(allInvoices);
      setTransactions(allTransactions);

      const apps = await services.application.getAllApplications(); 
      const activeEscrowTx = allTransactions.filter(t => t.type === "job_escrow" && (t.status === "funded" || t.status === "approved"));
      
      const escrowsWithApps = activeEscrowTx.map(tx => {
        const parsedJobId = tx.code.replace("escrow_fund_", "");
        const app = apps.find(a => a.jobId === parsedJobId && (a.status === "accepted" || a.status === "completed"));
        return {
          ...tx,
          translatorId: app?.translatorId,
          applicationId: app?.$id,
          earlyReleaseRequested: app?.earlyReleaseRequested
        };
      });
      setEscrows(escrowsWithApps);
    } catch (err: any) {
      console.error("Failed to load financial data", err);
    } finally {
      setLoading(false);
    }
  }

  // Admin metrics
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const platformRevenue = invoices.reduce((sum, inv) => sum + inv.feeAmount, 0);
  const totalInvoices = invoices.length;

  const handleManualRelease = async (jobId: string, translatorId: string, amount: number) => {
    const parsedJobId = jobId.replace("escrow_fund_", "");
    const email = payoutEmails[parsedJobId];
    if (!email) {
      alert("Please enter a PayPal Email to send the funds.");
      return;
    }
    
    try {
      setReleasingId(jobId);
      const services = getServices();
      
      // Attempt PayPal payout first (Mocking success if API route is not fully ready for live payouts)
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email })
      });
      
      if (!res.ok) {
        throw new Error("PayPal Payout Failed");
      }

      await services.ledger.processEscrowRelease(parsedJobId, translatorId, amount, "MANUAL_ADMIN_RELEASE");
      
      setEscrows(prev => prev.filter(e => e.code !== jobId));
      setPayoutEmails(prev => { const n = {...prev}; delete n[parsedJobId]; return n; });
      alert("Escrow released and funds sent via PayPal successfully!");
    } catch (err: any) {
      alert("Failed to release escrow: " + err.message);
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["admin", "staff"]}>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Platform Financials</h1>
              <p className="text-muted-foreground">Global overview of transactions, revenue, and invoices</p>
            </div>
            <Button variant="outline" onClick={loadFinanceData} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Platform Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">${platformRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total commission earned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transaction Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalVolume.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Gross transaction value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalInvoices}</div>
                    <p className="text-xs text-muted-foreground mt-1">Invoices issued across the platform</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="mt-8">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="escrows">Active Escrows</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Recent Transactions</CardTitle>
                        <CardDescription>Global ledger activity</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {transactions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No transactions found.</p>
                        ) : (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {transactions.map((trx) => (
                              <div key={trx.$id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                  {trx.status === "funded" ? (
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full"><ArrowDownRight className="h-4 w-4" /></div>
                                  ) : (
                                    <div className="p-2 bg-rose-100 text-rose-700 rounded-full"><ArrowUpRight className="h-4 w-4" /></div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-sm capitalize">{trx.type.replace('_', ' ')}</p>
                                    <p className="text-xs text-muted-foreground">{trx.userId} • {new Date(trx.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={trx.status === "funded" ? "text-emerald-600 font-bold text-sm" : "text-rose-600 font-bold text-sm"}>
                                    ${trx.amount.toFixed(2)}
                                  </span>
                                  <p className="text-[10px] text-muted-foreground uppercase">{trx.status}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="invoices">
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> All Invoices</CardTitle>
                      <CardDescription>System-wide generated invoices showing fixed platform fees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {invoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No invoices found.</p>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {invoices.map((inv) => (
                            <div key={inv.$id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                              <div>
                                <p className="font-semibold text-sm">Invoice {inv.$id.substring(0, 8)}...</p>
                                <p className="text-xs text-muted-foreground">PayPal ID: {inv.paypalTransactionId || "N/A"}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">${inv.totalAmount.toFixed(2)}</span>
                                <p className="text-xs text-muted-foreground capitalize">{inv.type.replace('_', ' ')}</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(inv)}>View</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="escrows">
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Active Escrows</CardTitle>
                      <CardDescription>Funds held by platform awaiting 30-day payout</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {escrows.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No active escrows.</p>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {escrows.map((trx) => (
                            <div key={trx.$id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                              <div>
                                <p className="font-semibold text-sm">Project: {trx.code.replace('escrow_fund_', '')}</p>
                                <p className="text-xs text-muted-foreground">PayPal Capture: {trx.transactionId}</p>
                                <div className="mt-2 flex gap-2 items-center">
                                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                                    Status: {trx.status.toUpperCase()}
                                  </span>
                                  {trx.earlyReleaseRequested && (
                                    <span className="px-2 py-1 text-xs font-medium bg-rose-100 text-rose-800 rounded-md">
                                      Early Release Requested
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                <span className="font-bold text-lg text-emerald-600">${trx.amount.toFixed(2)}</span>
                                <div className="flex gap-2 items-center mt-1">
                                  <Input 
                                    placeholder="Translator PayPal Email" 
                                    className="w-[200px] h-8 text-xs" 
                                    value={payoutEmails[trx.code.replace('escrow_fund_', '')] || ""}
                                    onChange={(e) => setPayoutEmails(prev => ({...prev, [trx.code.replace('escrow_fund_', '')]: e.target.value}))}
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleManualRelease(trx.code, trx.translatorId || "MANUAL_TRANSLATOR_ID", trx.amount)}
                                    disabled={releasingId === trx.code}
                                  >
                                    {releasingId === trx.code ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Force Release Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}

          {selectedInvoice && (
            <InvoiceViewer invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
