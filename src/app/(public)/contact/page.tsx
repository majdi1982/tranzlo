import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-24 bg-[var(--bg-main)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-xl text-[var(--text-secondary)]">
            We&apos;re here to help and answer any question you might have.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--accent)] shrink-0 shadow-sm">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Email Us</h3>
                  <p className="text-[var(--text-secondary)] mt-1">For general inquiries and support.</p>
                  <a href="mailto:support@tranzlo.net" className="text-[var(--accent)] font-medium hover:underline mt-2 inline-block">support@tranzlo.net</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--accent)] shrink-0 shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Live Chat</h3>
                  <p className="text-[var(--text-secondary)] mt-1">Chat with our support team in real-time.</p>
                  <button className="text-[var(--accent)] font-medium hover:underline mt-2 inline-block">Start a conversation</button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">Full Name</label>
                  <input type="text" id="name" className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" placeholder="John Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">Email Address</label>
                  <input type="email" id="email" className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--text-primary)]">How can we help?</label>
                <select id="category" className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                  <option>General Support</option>
                  <option>Billing Question</option>
                  <option>Partnership Inquiry</option>
                  <option>Report an Issue</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[var(--text-primary)]">Message</label>
                <textarea id="message" rows={4} className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" placeholder="How can we help you today?"></textarea>
              </div>
              <button type="button" className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover)] transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
