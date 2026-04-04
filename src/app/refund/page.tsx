export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>Refund Policy</h1>
        <p>Last updated: April 4, 2026</p>

        <h2>1. Subscription Refunds</h2>
        <p>
          Tranzlo offers a 14-day free trial on all plans. Once the trial has expired and a subscription fee has been charged via Fatora, refunds are generally not provided except where required by law.
        </p>

        <h2>2. Job Payment Refunds (Escrow)</h2>
        <p>
          For Company-to-Translator jobs, funds are held in Escrow. If a dispute arises, it will be handled by our Resolution Center. Refunds to Companies for unsatisfactory work are decided strictly on a case-by-case basis by Tranzlo mediators.
        </p>

        <h2>3. Contact Us</h2>
        <p>
          If you believe you have been billed in error, please contact our support team within 7 days of the transaction.
        </p>
      </div>
    </div>
  );
}
