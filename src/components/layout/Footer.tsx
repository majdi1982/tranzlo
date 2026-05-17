import { Languages, Globe, Mail, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Languages className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Tranzlo</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              The world's most advanced professional translation marketplace. Connecting expertise with opportunity.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white transition-colors">
                <Info className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {[
            { title: "Platform", links: ["Marketplace", "Translators", "Companies", "Pricing"] },
            { title: "Support", links: ["Help Center", "Safety", "Terms of Service", "Privacy Policy"] },
            { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] }
          ].map((column, i) => (
            <div key={i}>
              <h4 className="text-slate-800 dark:text-white font-bold mb-6">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link to="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-600 text-sm font-medium">
            © {new Date().getFullYear()} Tranzlo Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-600 font-medium">
            <a href="#" className="hover:text-slate-900 hover:dark:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 hover:dark:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
