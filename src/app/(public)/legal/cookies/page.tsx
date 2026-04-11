export default function CookiesPage() {
  return (
    <div className="py-24 bg-[var(--bg-main)] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl prose dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Cookies Policy</h1>
        <p className="text-[var(--text-secondary)] mt-4">Last Updated: October 2026</p>
        <div className="mt-8 text-[var(--text-secondary)] space-y-4">
          <p>This Cookies Policy explains how Tranzlo uses cookies to improve your user experience and manage authentication states across our network.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">1. Essential Cookies</h3>
          <p>These cookies are strictly necessary to provide you with services available through our Website and to use some of its features. This most namely includes the secure HTTP-only sessions we use to determine whether you are logged in (e.g., `tranzlo-session`). Because these cookies are strictly necessary to deliver the website, you cannot refuse them.</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">2. Preference Cookies</h3>
          <p>These cookies allow us to remember choices you make when you use our website, such as remembering your language preferences or your preferred platform theme (Light/Dark mode via `next-themes`).</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6">3. Withdrawing Consent</h3>
          <p>You have the right to decide whether to accept or reject non-essential cookies via our Cookie Consent Bar shown during your initial visit to Tranzlo.</p>
        </div>
      </div>
    </div>
  );
}
