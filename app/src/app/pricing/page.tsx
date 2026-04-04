import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl border-b-4 border-indigo-500 inline-block pb-2">
            Pricing Plans
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Choose the right plan for your translation needs. All plans include a 14-day free trial on signup!
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Translator Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">For Translators</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Join our marketplace and start bidding on jobs globally.</p>
              <div className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$15</span>
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <ul className="mt-8 space-y-4 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">✓ Access to global verified companies</li>
                <li className="flex items-center">✓ Set your own rates</li>
                <li className="flex items-center">✓ Secure Escrow Payments</li>
                <li className="flex items-center">✓ 14-Days Free Trial</li>
              </ul>
              <Link
                href="/signup?role=translator"
                className="mt-8 block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold py-3 px-4 rounded-xl transition duration-200"
              >
                Sign Up as Translator
              </Link>
            </div>
          </div>

          {/* Company Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 border-indigo-500 overflow-hidden transform hover:-translate-y-2 transition duration-300 relative">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">For Companies</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Post jobs, hire top tier translators, and manage invoices.</p>
              <div className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$49</span>
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <ul className="mt-8 space-y-4 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">✓ Post unlimited jobs</li>
                <li className="flex items-center">✓ Custom Filters & Advanced Search</li>
                <li className="flex items-center">✓ AI-powered matching via n8n</li>
                <li className="flex items-center">✓ 14-Days Free Trial</li>
              </ul>
              <Link
                href="/signup?role=company"
                className="mt-8 block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold py-3 px-4 rounded-xl transition duration-200"
              >
                Sign Up as Company
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
