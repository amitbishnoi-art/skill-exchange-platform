import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useMatch } from '../hooks/useMatch';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, BookOpen, TrendingUp, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { requests, exchanges, users, sessions } = useData();
  const { suggestedMatches } = useMatch();

  const pendingRequests = requests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');
  const activeExchanges = exchanges.filter(e => e.status === 'active' && e.users.includes(currentUser.id));
  
  // Calculate stats for chart
  const totalHours = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
  
  // Hours per exchange for the chart
  const statsByExchange = activeExchanges.map(ex => {
    const partnerId = ex.users.find(id => id !== currentUser.id);
    const partner = users.find(u => u.id === partnerId);
    const hours = sessions
      .filter(s => s.exchangeId === ex.id)
      .reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    
    return {
      name: partner?.name || 'Partner',
      skill: ex.skills[partnerId],
      hours: hours
    };
  });

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {currentUser?.name}! 👋</h1>
          <p className="text-slate-500 mt-1 font-medium">Keep growing—you've logged {totalHours.toFixed(1)} hours of learning so far.</p>
        </div>
        <Link to="/profile" className="inline-flex items-center space-x-2 text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors">
          <span>Complete Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Connections</h3>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{activeExchanges.length}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Active skill exchanges</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">New Requests</h3>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{pendingRequests.length}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Waiting for your response</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm bg-gradient-to-br from-primary-600 to-primary-700 text-white group hover:shadow-lg hover:shadow-primary-500/20 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-100 font-bold text-sm uppercase tracking-wider">Discover</h3>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black mt-4 tracking-tight">{suggestedMatches.length}</p>
          <p className="text-xs text-primary-100 mt-2 font-medium">Smart matches waiting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Visualization */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
              <BarChart2 className="w-6 h-6 mr-2 text-primary-600" /> Learning Progress
            </h2>
          </div>
          
          <div className="space-y-6">
            {statsByExchange.length > 0 ? statsByExchange.map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{stat.skill}</p>
                    <p className="text-xs text-slate-500 font-medium">with {stat.name}</p>
                  </div>
                  <span className="text-sm font-black text-primary-600">{stat.hours.toFixed(1)}h</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stat.hours / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium">Start an exchange to track your progress!</p>
              </div>
            )}
          </div>
        </div>

        {/* Incoming Requests List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-orange-500" /> Recent Requests
            </h2>
            <Link to="/exchanges" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center group">
              Hub <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium italic">
                No pending requests.
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {pendingRequests.slice(0, 4).map(req => {
                  const sender = users.find(u => u.id === req.senderId);
                  return (
                    <li key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img src={sender?.avatar} alt="" className="w-12 h-12 rounded-2xl border border-slate-100" />
                        <div>
                          <p className="font-bold text-slate-900">{sender?.name}</p>
                          <p className="text-sm text-slate-500 font-medium line-clamp-1">Learning <span className="text-slate-900">{req.targetSkill}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-orange-100 text-orange-700">
                          Pending
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Top Suggestion Banner */}
      {suggestedMatches.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6 text-center md:text-left">
              <img src={suggestedMatches[0].avatar} alt="" className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-2xl" />
              <div>
                <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Top Match for You</p>
                <h3 className="text-3xl font-black tracking-tight">{suggestedMatches[0].name}</h3>
                <p className="text-blue-100 font-medium">Offers {suggestedMatches[0].skillsOffered[0]} • Wants {suggestedMatches[0].skillsWanted[0]}</p>
              </div>
            </div>
            <Link 
              to="/discover" 
              className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl whitespace-nowrap"
            >
              Start Exchange
            </Link>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
