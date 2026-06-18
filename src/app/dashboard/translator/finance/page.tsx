"use client";

import * as React from "react";
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Invoice, LedgerEntry } from "@/types/finance";
import { InvoiceViewer } from "@/components/finance/invoice-viewer";

export default function TranslatorFinancePage() {
  const { user } = useSession();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [transactions, setTransactions] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  React.useEffect(() => {
    async function loadFinanceData() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const [invData, trxData] = await Promise.all([
          services.ledger.getInvoicesByUser(user.$id),
          services.ledger.getTransactionsByUser(user.$id),
        ]);
        setInvoices(invData);
        setTransactions(trxData);
      } catch (err) {
        console.error("Failed to load finance data", err);
      } finally {
        setLoading(false);
      }
    }
    loadFinanceData();
  }, [user?.$id]);

  const totalEarnings = transactions
    .filter(t => t.type === "job_escrow" && t.status === "released") // Assuming payouts to translator are released
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Track your earnings, payments, and invoices</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">Total Earnings (USD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">${totalEarnings.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total lifetime earnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Invoices Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoices.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total invoices related to your work</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Ledger entries</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Transactions</CardTitle>
                    <CardDescription>Recent ledger entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {transactions.slice(0, 10).map((trx) => (
                          <div key={trx.$id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                            <div className="flex items-center gap-3">
                              {trx.status === "released" ? (
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full"><ArrowDownRight className="h-4 w-4" /></div>
                              ) : (
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full"><ArrowUpRight className="h-4 w-4" /></div>
                              )}
                              <div>
                                <p className="font-semibold text-sm capitalize">{trx.status === "released" ? "Payout" : trx.type.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{new Date(trx.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-600 font-bold text-sm">
                                +${trx.amount.toFixed(2)}
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
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Invoices</CardTitle>
                    <CardDescription>Invoices for your completed jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoices.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No invoices yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {invoices.slice(0, 10).map((inv) => (
                          <div key={inv.$id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                            <div>
                              <p className="font-semibold text-sm">Invoice {inv.$id}</p>
                              <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-sm">${inv.totalAmount.toFixed(2)}</span>
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
