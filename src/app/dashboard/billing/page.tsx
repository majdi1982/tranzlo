"use client"

import React, { useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, FileText, Download, Plus } from "lucide-react"
import { Button } from "@/components/atoms/Button"

export default function BillingPage() {
  const [transactions] = useState([
    { id: "1", type: "payment", amount: 450, status: "completed", date: "2024-05-10", project: "SaaS Localization" },
    { id: "2", type: "deposit", amount: 1000, status: "completed", date: "2024-05-08", method: "PayPal" },
    { id: "3", type: "payment", amount: 200, status: "pending", date: "2024-05-12", project: "Marketing Copy" },
  ])

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-outfit mb-2">Billing & Wallet</h1>
            <p className="text-muted-foreground">Manage your funds, deposits, and payment history.</p>
          </div>
          <Button className="gap-2 shadow-lg shadow-primary/20 h-12 px-8">
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
        </div>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 bg-premium-gradient text-white border-none relative overflow-hidden group shadow-2xl shadow-primary/10"
            >
              <Wallet className="w-12 h-12 mb-6 opacity-20 absolute -right-4 -top-4 scale-150 rotate-12" />
              <p className="text-white/60 text-sm font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold mb-8">$1,240.50</h2>
              <div className="flex gap-3">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/10 text-white w-full h-11">
                  Withdraw
                </Button>
              </div>
            </motion.div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Methods
              </h3>
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white">PAYPAL</div>
                  <span className="text-sm font-medium">john.smith@global.com</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <Button variant="outline" className="w-full h-11 border-dashed border-white/10 hover:border-primary/30">
                Add New Method
              </Button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </div>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "deposit" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                    }`}>
                      {tx.type === "deposit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{tx.type === "deposit" ? "Funds Added" : `Payment: ${tx.project}`}</h4>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-tighter">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${tx.type === "deposit" ? "text-green-500" : "text-foreground"}`}>
                      {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      tx.status === "completed" ? "bg-green-500/5 text-green-500 border-green-500/10" : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
