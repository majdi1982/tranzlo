import { useState, useEffect } from 'react';
import { Zap, Users, Briefcase, Globe } from 'lucide-react';

const RealtimeCounters = () => {
  const [counts, setCounts] = useState({
    activeTranslators: 1242,
    liveProjects: 86,
    totalWords: '1.2M',
    countriesServed: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        ...prev,
        activeTranslators: prev.activeTranslators + (Math.random() > 0.5 ? 1 : -1),
        liveProjects: prev.liveProjects + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Active Translators', value: counts.activeTranslators.toLocaleString(), icon: <Users className="w-4 h-4" />, color: 'blue' },
    { label: 'Live Projects', value: counts.liveProjects, icon: <Briefcase className="w-4 h-4" />, color: 'emerald' },
    { label: 'Words Translated', value: counts.totalWords, icon: <Zap className="w-4 h-4" />, color: 'amber' },
    { label: 'Countries', value: counts.countriesServed, icon: <Globe className="w-4 h-4" />, color: 'indigo' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm backdrop-blur-sm flex items-center gap-4 group hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-md transition-all duration-300">
          <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 dark:text-${stat.color}-400`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-0.5">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-800 dark:text-white tabular-nums">{stat.value}</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealtimeCounters;
