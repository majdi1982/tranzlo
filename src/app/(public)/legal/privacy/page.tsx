export default function PrivacyPage() {
  return (
    <div className="py-24 bg-[var(--bg-main)] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl prose dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)] mt-4">Last Updated: October 2026</p>
        <div className="mt-8 text-[var(--text-secondary)] space-y-4">
          <p>Your privacy is important to us. This Privacy Policy outlines how Tranzlo collects, uses, and safeguards your personal data when you use our marketplace platform.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">1. Information We Collect</h3>
          <p>We may collect personal identification information including your name, email address, profile information, and professional credentials during the onboarding and verification processes.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">2. How We Use Your Information</h3>
          <p>We use your information to facilitate marketplace interactions, verify identities, process payments securely, and send automated notifications via established third-party services like Appwrite and n8n.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">3. Third-Party Processors</h3>
          <p>Tranzlo utilizes Fatora.io for secure transaction processing. Your payment credentials are never stored directly on our servers.</p>
        </div>
      </div>
    </div>
  );
}
