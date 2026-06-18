"use client";

import * as React from "react";
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Invoice, LedgerEntry } from "@/types/finance";
import { InvoiceViewer } from "@/components/finance/invoice-viewer";

export default function AdminFinancialsPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [transactions, setTransactions] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  React.useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    setLoading(true);
    try {
      const services = getServices();
      // To keep it simple, we use the ledger service. In a real scenario, we might need a getPlatformLedger method.
      // Assuming getTransactionsByUser without userId fetches all (for admin) if service allows, 
      // but Appwrite queries need to be properly set up. 
      // For now, let's fetch all invoices and transactions using the mock/admin method or default queries.
      // This is a placeholder for Admin global fetching
      const allInvoices = await services.ledger.getInvoicesByUser(""); 
      const allTransactions = await services.ledger.getTransactionsByUser(""); 
      setInvoices(allInvoices);
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to load global finance data", err);
    } finally {
      setLoading(false);
    }
  }

  // Admin metrics
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const platformRevenue = invoices.reduce((sum, inv) => sum + inv.feeAmount, 0);
  const totalInvoices = invoices.length;

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
                              {trx.type === "deposit" ? (
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full"><ArrowDownRight className="h-4 w-4" /></div>
                              ) : (
                                <div className="p-2 bg-rose-100 text-rose-700 rounded-full"><ArrowUpRight className="h-4 w-4" /></div>
                              )}
                              <div>
                                <p className="font-semibold text-sm capitalize">{trx.type}</p>
                                <p className="text-xs text-muted-foreground">{trx.userId} • {new Date(trx.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={trx.type === "deposit" ? "text-emerald-600 font-bold text-sm" : "text-rose-600 font-bold text-sm"}>
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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> All Invoices</CardTitle>
                    <CardDescription>System-wide generated invoices</CardDescription>
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
                              <p className="text-xs text-muted-foreground">User: {inv.userId}</p>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <p className="font-bold text-sm">${inv.totalAmount.toFixed(2)}</p>
                                <p className="text-xs text-primary font-medium">Fee: ${inv.feeAmount.toFixed(2)}</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(inv)}>View</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
