"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { getServices } from "@/services";
import { Printer, Download, ArrowLeft, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  const params = useParams();
  const role = params.role as string;
  const appId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        const services = getServices();
        const app = await services.application.getApplicationById(appId);
        if (!app) throw new Error("Application not found");
        
        const job = await services.job.getJob(app.jobId);
        if (!job) throw new Error("Job not found");

        const companyProfile = await services.profile.getCompanyProfile(job.companyId);
        const translatorProfile = await services.profile.getTranslatorProfile(app.translatorId);

        // Fetch actual invoice if available to get locked fees and paypal transaction ID
        const invoices = await services.ledger.getInvoicesByJob(job.$id);
        const invoice = invoices.find(inv => role === "company" ? inv.companyFeeAmount > 0 : inv.translatorFeeAmount > 0);

        setData({ app, job, companyProfile, translatorProfile, invoice });
      } catch (err: any) {
        setError(err.message || "Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
         <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
         <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <FileText className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Error Loading Invoice</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
         </div>
      </div>
    );
  }

  const { app, job, companyProfile, translatorProfile, invoice } = data;
  
  // Financial calculations
  const subtotal = job.budget;
  let platformFee = 0;
  let total = 0;
  
  if (role === "company") {
    // If invoice exists (locked at funding), use its values. Otherwise fallback to current rate.
    platformFee = invoice ? invoice.companyFeeAmount : (app.companyFeeAmount || subtotal * 0.05);
    total = invoice ? invoice.totalCompanyPaid : (subtotal + platformFee);
  } else {
    // Translator receives budget - fee
    platformFee = invoice ? invoice.translatorFeeAmount : (app.translatorFeeAmount || subtotal * 0.10);
    total = invoice ? invoice.netTranslatorEarned : (subtotal - platformFee);
  }

  const paypalTxId = invoice?.paypalTransactionId;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 font-sans print:bg-white print:py-0">
       <div className="max-w-3xl mx-auto space-y-4 print:space-y-0 print:max-w-none">
          
          <div className="flex justify-between items-center mb-6 print:hidden px-4 md:px-0">
             <Button variant="outline" className="bg-white" onClick={() => window.close()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Close Window
             </Button>
             <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                <Printer className="h-4 w-4 mr-2" /> Print / Save as PDF
             </Button>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
             {/* Header */}
             <div className="flex justify-between items-start border-b border-slate-200 pb-8">
                <div>
                   <h1 className="text-3xl font-black text-teal-700 tracking-tight">TRANZLO</h1>
                   <p className="text-sm font-medium text-slate-500 tracking-wide mt-1">Official Invoice / Receipt</p>
                </div>
                <div className="text-right">
                   <h2 className="text-2xl font-bold text-slate-800 mb-1">INVOICE</h2>
                   <p className="text-sm font-semibold text-slate-600">#{app.$id.slice(-8).toUpperCase()}</p>
                   <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
             </div>

             {/* Addresses */}
             <div className="flex flex-col md:flex-row justify-between gap-8 py-8">
                <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed {role === "company" ? "To" : "From"}</p>
                   <p className="font-bold text-slate-800">{role === "company" ? companyProfile?.fullName : "Tranzlo Platform"}</p>
                   <p className="text-sm text-slate-600">{role === "company" ? "Client Account" : "tranzlo.com"}</p>
                </div>
                <div className="space-y-1 text-left md:text-right">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{role === "company" ? "Payable To" : "Billed To"}</p>
                   <p className="font-bold text-slate-800">{role === "company" ? "Tranzlo Platform" : translatorProfile?.fullName}</p>
                   <p className="text-sm text-slate-600">{role === "company" ? "tranzlo.com" : "Translator Account"}</p>
                </div>
             </div>

             {/* Job Details */}
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8">
                <h3 className="font-bold text-slate-800 mb-2">Project: {job.title}</h3>
                <p className="text-sm text-slate-600">Language Pair: {job.languagePair}</p>
                <p className="text-sm text-slate-600">Type: {job.jobType}</p>
                <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-emerald-600">
                   <CheckCircle2 className="h-4 w-4" />
                   Project Completed & Delivered
                </div>
             </div>

             {/* Line Items */}
             <div className="mb-8">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b-2 border-slate-200">
                         <th className="py-3 font-bold text-slate-800">Description</th>
                         <th className="py-3 font-bold text-slate-800 text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm">
                      <tr className="border-b border-slate-100">
                         <td className="py-4 text-slate-600">Translation Services - "{job.title}"</td>
                         <td className="py-4 text-slate-800 font-medium text-right">${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                         <td className="py-4 text-slate-600">
                            {role === "company" ? "Platform Service Fee (5%)" : "Platform Service Fee (10%)"}
                         </td>
                         <td className="py-4 text-rose-600 font-medium text-right">
                            {role === "company" ? "+" : "-"}${platformFee.toFixed(2)}
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>

             {/* Totals */}
             <div className="flex justify-end">
                <div className="w-full md:w-1/2 bg-slate-50 p-5 rounded-xl border border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600 font-medium">Subtotal</span>
                      <span className="text-slate-800 font-semibold">${subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600 font-medium">{role === "company" ? "Platform Fee" : "Platform Deduction"}</span>
                      <span className="text-rose-600 font-semibold">{role === "company" ? "+" : "-"}${platformFee.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                      <span className="font-bold text-lg text-slate-800">{role === "company" ? "Total Paid" : "Total Earnings"}</span>
                      <span className="font-black text-2xl text-teal-600">${total.toFixed(2)} USD</span>
                   </div>
                </div>
                
                {paypalTxId && (
                  <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700">Payment Reference</p>
                    <p className="text-sm text-slate-600 mt-1">PayPal Transaction ID: <span className="font-mono">{paypalTxId}</span></p>
                  </div>
                )}
             </div>

             {/* Footer */}
             <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
                <p className="font-medium">Thank you for using Tranzlo!</p>
                <p className="mt-1">If you have any questions concerning this invoice, contact support@tranzlo.com</p>
             </div>
          </div>
       </div>
    </div>
  )
}
