export default function RefundPage() {
  return (
    <div className="py-24 bg-[var(--bg-main)] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl prose dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Refund Policy</h1>
        <p className="text-[var(--text-secondary)] mt-4">Last Updated: October 2026</p>
        <div className="mt-8 text-[var(--text-secondary)] space-y-4">
          <p>This Refund Policy explains under what circumstances Tranzlo provides refunds for marketplace services and premium subscriptions.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">1. Subscription Renewals</h3>
          <p>Pro subscriptions are billed monthly. If you cancel your subscription, you will retain access until the end of the current billing cycle. Refunds are generally not provided for partial months.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">2. Trial Behavior</h3>
          <p>New users selecting a paid tier receive a 14-day trial period. If you cancel your subscription before the trial ends, your payment method will not be charged.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">3. Dispute Resolution</h3>
          <p>Refunds pertaining strictly to translator-company service agreements are mediated through our robust dispute resolution system. Tranzlo staff will evaluate non-delivery of translated works before issuing compensation credits.</p>
        </div>
      </div>
    </div>
  );
}
