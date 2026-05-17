import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Footer from '../components/layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30">
      <Navbar />
      <main>
        <Hero />
        
        {/* Statistics Section */}
        <section className="py-20 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { label: "Active Translators", value: "25,000+" },
                { label: "Completed Projects", value: "150,000+" },
                { label: "Language Pairs", value: "300+" },
                { label: "Customer Rating", value: "4.9/5" }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-slate-400 text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-blue-600/20 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Ready to break the language barrier?</h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Join thousands of businesses and professionals who trust Tranzlo for their global communication needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-blue-600/20">
                Register Now
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 hover:border-white text-white rounded-full font-bold text-lg transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
