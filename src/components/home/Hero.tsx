import { ArrowRight, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-bounce">
          <Globe className="w-4 h-4" />
          <span>Connecting the World Through Language</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8">
          The Future of <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Professional Translation
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed">
          Connect with top-tier translators worldwide or grow your business as a linguistic expert. 
          Seamless, secure, and AI-powered.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/marketplace" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Explore Projects
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <ShieldCheck className="w-8 h-8" />, title: "Secure Escrow", desc: "Payments are held safely until project completion." },
            { icon: <Zap className="w-8 h-8" />, title: "Fast Turnaround", desc: "Proprietary matching algorithm for instant connections." },
            { icon: <Globe className="w-8 h-8" />, title: "Global Reach", desc: "Access translators in over 150+ language pairs." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
