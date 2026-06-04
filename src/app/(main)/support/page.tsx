"use client";

import * as React from "react";
import { Search, HelpCircle, Mail, MessageSquare, Send, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "account" | "translation" | "billing";
}

const FAQS: FAQItem[] = [
  // General
  {
    question: "What is Tranzlo?",
    answer: "Tranzlo is an enterprise-grade translation marketplace that connects professional translators and language service agencies with businesses looking for high-quality localization services.",
    category: "general"
  },
  {
    question: "How does the platform escrow system work?",
    answer: "To ensure safety for both sides, businesses fund jobs in escrow before work begins. Once the translator delivers the work and the company approves it, the funds are automatically released to the translator's account.",
    category: "general"
  },
  // Account
  {
    question: "How do I upgrade my account tier?",
    answer: "You can upgrade your account anytime by visiting your Dashboard and clicking on the Plans section. We support credit/debit cards and PayPal for instant activation.",
    category: "account"
  },
  {
    question: "Can I add team members to my account?",
    answer: "Yes! If you are on the Plus Member tier (for translators) or the Pro/Plus Business tiers (for companies), you can invite and manage up to 3 team collaborators under the Team page.",
    category: "account"
  },
  // Translation
  {
    question: "How many languages can I support as a translator?",
    answer: "Free tier accounts support 1 translation language. Pro Member accounts support up to 5 languages, and Plus Member accounts support up to 10 languages.",
    category: "translation"
  },
  {
    question: "How are translation jobs matched?",
    answer: "Jobs are matched automatically based on your profile's language pairs, translation specialities, and your review ratings. Pro and Plus members receive higher matching priority.",
    category: "translation"
  },
  // Billing
  {
    question: "What are the platform fee rates?",
    answer: "Translators on the Free tier have a 20% platform fee. Upgrading to Pro Member reduces it to 10%, and Plus Member reduces it to only 5%. For companies, Free is 5%, Pro Business is 2%, and Plus Business is 0%.",
    category: "billing"
  },
  {
    question: "How do payouts work for translators?",
    answer: "Payouts are processed automatically via PayPal. Standard accounts have a 30-day payout holding period, while Pro and Plus translators benefit from automatic payouts immediately upon project approval.",
    category: "billing"
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | "general" | "account" | "translation" | "billing">("all");
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [category, setCategory] = React.useState("general");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Mock API submission wait
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Clear form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitStatus("success");
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 lg:px-8 bg-gradient-to-b from-background to-accent/5">
      <div className="mx-auto max-w-5xl space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Support & Help Center</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            How can we help you today?
          </h1>
          <p className="text-lg text-muted-foreground">
            Search our knowledge base or submit a support ticket directly to our help desk.
          </p>

          {/* Real-time FAQ Search Bar */}
          <div className="relative mt-8 max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQs (e.g., payouts, plans, teams)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Support Grid (FAQs + Contact Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FAQ Section (Column Span: 7) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Frequently Asked Questions
              </h2>
              
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {(["all", "general", "account", "translation", "billing"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setOpenFaqIndex(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Accordion List */}
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-border/80 rounded-2xl bg-background/50 hover:bg-background/80 transition-all duration-200 overflow-hidden shadow-2sm"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-foreground focus:outline-none"
                      >
                        <span>{faq.question}</span>
                        <ArrowRight
                          className={`h-4 w-4 text-primary transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-[200px] border-t border-border/50 p-5 bg-accent/5" : "max-h-0"
                        } overflow-hidden`}
                      >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-background/30">
                  <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-55" />
                  <p className="text-sm font-medium text-muted-foreground">No matches found for your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Support Form (Column Span: 5) */}
          <div className="lg:col-span-5">
            <div className="border border-border rounded-2xl p-6 md:p-8 bg-background/60 shadow-md space-y-6 backdrop-blur-md">
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Submit a Ticket
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our technical support and operations desk will respond to you within 24 hours.
                </p>
              </div>

              {submitStatus === "success" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Ticket Submitted successfully!</h4>
                    <p className="mt-1">We have received your message and sent a confirmation to your email address.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Failed to submit ticket</h4>
                    <p className="mt-1">Please double-check your entries and try again.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="support-name" className="text-xs font-semibold text-muted-foreground">
                    Your Name
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="support-email" className="text-xs font-semibold text-muted-foreground">
                    Your Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="support-cat" className="text-xs font-semibold text-muted-foreground">
                    Inquiry Category
                  </label>
                  <select
                    id="support-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="account">Account & Teams</option>
                    <option value="translation">Translation & Jobs</option>
                    <option value="billing">Billing & Subscriptions</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="support-subject" className="text-xs font-semibold text-muted-foreground">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of issue"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="support-msg" className="text-xs font-semibold text-muted-foreground">
                    How can we help?
                  </label>
                  <textarea
                    id="support-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 shadow-md bg-primary hover:bg-primary/95 text-xs text-primary-foreground transition-all"
                >
                  {submitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center pt-8 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Need immediate billing support?</span>
          </div>
          <span className="font-semibold text-primary">Email us directly: support@tranzlo.net</span>
        </div>

      </div>
    </div>
  );
}
