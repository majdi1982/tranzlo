export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: April 4, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly, such as your profile details, translation history, and billing information. 
          Through our integrations with Appwrite, Google, and LinkedIn, we receive verified email addresses and public profile details.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your data is used to match Translators with Company jobs, facilitate payments through Fatora, and send system notifications via n8n workflows. We do not sell your personal data to non-affiliated third parties.
        </p>

        <h2>3. Third-Party Integrations</h2>
        <p>
          Tranzlo utilizes Appwrite (database & Auth), n8n (automation), and Fatora (payments). By using the Platform, you acknowledge that data necessary for these services to function will be transmitted securely.
        </p>
      </div>
    </div>
  );
}
