import * as React from "react";
import { X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/types/finance";

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceViewer({ invoice, onClose }: InvoiceViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Invoice #{invoice.$id.substring(0, 8).toUpperCase()}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8 print:p-0 print:overflow-visible" id="invoice-content">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-primary">TRANZLO</h1>
              <p className="text-sm text-muted-foreground mt-1">Professional Translation Platform</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Invoice</h3>
              <p className="font-semibold mt-2">#{invoice.$id}</p>
              <p className="text-sm text-muted-foreground">Issued: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <Badge variant="outline" className="mt-2 uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                {invoice.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-y py-6">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-semibold text-sm">User ID: {invoice.userId}</p>
              {/* Note: Normally you'd fetch company name/details */}
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Service Details</p>
              <p className="font-semibold text-sm">Job ID: {invoice.jobId}</p>
            </div>
          </div>

          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm font-semibold text-muted-foreground">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-4">Project Base Funding</td>
                  <td className="py-4 text-right font-semibold">${invoice.jobBaseValue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-muted-foreground">Platform Fee</td>
                  <td className="py-4 text-right font-semibold text-muted-foreground">${invoice.feeAmount.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary">
                  <td className="pt-4 font-bold text-lg text-right">Total USD</td>
                  <td className="pt-4 font-black text-2xl text-primary text-right">${invoice.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-sm text-muted-foreground pt-8 text-center border-t">
            <p>Thank you for using Tranzlo.</p>
            <p>If you have any questions about this invoice, please contact support@tranzlo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
