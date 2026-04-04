'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Basic check if user already consented
    const consent = localStorage.getItem('tranzlo_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('tranzlo_cookie_consent', 'true');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('tranzlo_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-4 bg-gray-900 rounded-lg shadow-2xl flex flex-col sm:flex-row items-center justify-between border border-gray-800">
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-indigo-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-white text-sm">
              We use cookies to ensure you get the best experience, facilitate Appwrite authentication, and secure Fatora payments.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex gap-2 w-full sm:w-auto">
            <button
              onClick={acceptCookies}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={declineCookies}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
