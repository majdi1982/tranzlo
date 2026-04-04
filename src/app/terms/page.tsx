export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>Terms and Conditions</h1>
        <p>Last updated: April 4, 2026</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using the Tranzlo marketplace ("Platform"), you agree to be bound by these Terms and Conditions. 
          If you do not agree to all the terms and conditions, you must not access the Platform.
        </p>

        <h2>2. User Roles</h2>
        <p>
          The Platform is a marketplace facilitating interactions between two primary entities:
          <strong> Translators</strong> and <strong>Companies</strong>. Tranzlo provides the infrastructure, Escrow via Fatora, and matching mechanics but is not a party to the independent contracts formed between Translators and Companies.
        </p>

        <h2>3. 14-Day Free Trial</h2>
        <p>
          New user accounts may be eligible for a 14-day full-feature trial. Following the trial, a valid payment method must be processed via Fatora to continue operations.
        </p>

        <h2>4. Prohibited Behavior</h2>
        <p>
          Users must not circumvent the Platform to avoid fees. All communications and payments regarding jobs initiated on Tranzlo must occur within the Platform. Transmitting malware, abusing the API, or harassing users via our chat systems will result in immediate suspension.
        </p>
      </div>
    </div>
  );
}
