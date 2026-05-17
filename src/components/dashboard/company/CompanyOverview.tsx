import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  Briefcase,
  PlusCircle
} from 'lucide-react';
import RealtimeCounters from './RealtimeCounters';

const CompanyOverview = () => {
  const stats = [
    { label: 'Active Projects', value: '12', icon: <Briefcase className="w-5 h-5" />, color: 'blue', trend: '+2' },
    { label: 'Team Members', value: '8', icon: <Users className="w-5 h-5" />, color: 'purple', trend: '+1' },
    { label: 'Hours Tracked', value: '142h', icon: <Clock className="w-5 h-5" />, color: 'indigo', trend: '+24h' },
    { label: 'Completed', value: '45', icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald', trend: '+5' },
  ];

  const recentProjects = [
    { name: 'Website Localization (AR-EN)', status: 'In Progress', progress: 65, budget: '$1,200', date: '2 hours ago' },
    { name: 'Technical Manual Translation', status: 'Review', progress: 90, budget: '$450', date: '5 hours ago' },
    { name: 'Marketing Campaign Content', status: 'Pending', progress: 10, budget: '$800', date: 'Yesterday' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <RealtimeCounters />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Company Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 dark:text-${stat.color}-400`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Projects</h3>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentProjects.map((project, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{project.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{project.date}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        project.status === 'Review' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-slate-550/10 text-slate-500 dark:text-slate-400'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-24 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-white">{project.budget}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Members Widget */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Team Members</h3>
            <button className="p-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600/20 transition-all">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Sarah Ahmed', role: 'Project Manager', initial: 'S', color: 'blue' },
              { name: 'Majdi Al-Qadi', role: 'Translator Staff', initial: 'M', color: 'purple' },
              { name: 'Omar Khaled', role: 'Reviewer', initial: 'O', color: 'indigo' },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl bg-${member.color}-500/20 flex items-center justify-center text-lg font-bold text-${member.color}-600 dark:text-${member.color}-400 group-hover:scale-110 transition-transform`}>
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white transition-all">
            Manage All Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
