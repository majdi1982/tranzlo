export default function TermsPage() {
  return (
    <div className="py-24 bg-[var(--bg-main)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl prose dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Terms & Conditions</h1>
        <p className="text-[var(--text-secondary)] mt-4">Last Updated: October 2026</p>
        <div className="mt-8 text-[var(--text-secondary)] space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the Tranzlo platform (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, you must cease use immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">2. Marketplace Dynamics</h2>
            <p>Tranzlo provides a venue for Companies to post translation requirements and Translators to provide professional services. Tranzlo is not a party to the independent contracts formed between users but provides the infrastructure for negotiation and payment.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Fees and Payments</h2>
            <p>Users agree to the pricing plans as outlined on our Pricing page. Payments are processed via Fatora.io. All subscription fees are non-refundable unless specified otherwise by local consumer law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">4. Confidentiality</h2>
            <p>Translators agree to maintain strict confidentiality regarding any source materials provided by Companies. Breach of confidentiality may result in immediate account termination and legal action by the affected Company.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">5. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Tranzlo operates, without regard to conflict of law principles.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
