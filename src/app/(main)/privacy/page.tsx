import React from "react";
import { Shield, Eye, Lock, RefreshCw, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | Tranzlo",
  description: "سياسة الخصوصية وحماية البيانات لمنصة Tranzlo للترجمة الفورية والاحترافية.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 bg-grid">
      {/* Background glow animations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-primary mb-4 glow-sm">
            <Shield className="h-10 w-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            سياسة الخصوصية
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            في Tranzlo، نضع خصوصية بياناتك وأمانها في مقدمة أولوياتنا. نلتزم بحماية بياناتك الشخصية وتوضيح كيفية التعامل معها بشفافية مطلقة.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>آخر تحديث: 31 مايو 2026</span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Card 1: Introduction */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">1. جمع المعلومات البصرية والشخصية</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  نقوم بجمع المعلومات اللازمة فقط لتقديم وتسهيل تجربة استخدامك لمنصة Tranzlo. يتضمن ذلك معلومات التسجيل الأساسية (الاسم، البريد الإلكتروني، كلمة المرور المشفرة)، بالإضافة إلى معلومات حسابك عند الربط مع خدمات الطرف الثالث مثل Google و LinkedIn لتسهيل الدخول الآمن.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Encryption */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">2. حماية وتشفير البيانات</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  تُخزن جميع كلمات المرور والبيانات الحساسة باستخدام بروتوكولات تشفير متقدمة وخوادم سحابية آمنة ومحمية (Appwrite Secured DB). نحرص على عدم مشاركة بياناتك الشخصية مع أي جهات خارجية غير مصرح لها، ونضمن تشفير كافة الاتصالات بين متصفحك وخوادمنا عبر شهادات SSL/TLS الآمنة.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: User Rights */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">3. حقوق المستخدم والتحكم بالبيانات</h2>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  لك كامل الأحقية والتحكم في بياناتك المسجلة على منصتنا في أي وقت من خلال صفحة إعدادات الحساب:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>تعديل أو تحديث البريد الإلكتروني وكلمة المرور.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>ربط أو إلغاء ربط حسابات Google و LinkedIn.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>حذف الحساب والبيانات المرتبطة به بشكل نهائي من خوادمنا.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Contact box */}
        <div className="mt-16 text-center border-t border-slate-800 pt-10">
          <p className="text-sm text-slate-400">
            إذا كانت لديك أي أسئلة أو استفسارات بخصوص سياسة الخصوصية الخاصة بنا، يرجى التواصل معنا مباشرة:
          </p>
          <a
            href="mailto:support@tranzlo.net"
            className="mt-3 inline-block text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
          >
            support@tranzlo.net
          </a>
        </div>
      </div>
    </div>
  );
}
