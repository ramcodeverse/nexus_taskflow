import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/auth';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Clock,
  Star,
} from 'lucide-react';

const dashboardTasks = [
  { title: 'Design system v2', assignee: 'AL', progress: 85, status: 'In Progress', color: 'bg-blue-500' },
  { title: 'API integration', assignee: 'MK', progress: 60, status: 'In Progress', color: 'bg-cyan-500' },
  { title: 'User onboarding', assignee: 'SR', progress: 100, status: 'Done', color: 'bg-emerald-500' },
  { title: 'Analytics dashboard', assignee: 'JD', progress: 30, status: 'Review', color: 'bg-amber-500' },
];

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind mockup */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-3xl blur-3xl scale-110" />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8" style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-md text-xs text-slate-400" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Zap className="w-3 h-3 text-blue-400" />
            nexus-taskflow.ai/dashboard
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Sprint 4 · Q2 2025</p>
              <h3 className="text-sm font-semibold text-white">Project Overview</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tasks Done', value: '24', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'In Progress', value: '8', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Team Score', value: '97%', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <p className="text-base font-bold text-white leading-none">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {dashboardTasks.map((task, i) => (
              <motion.div
                key={task.title}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {task.assignee}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ delay: 1.2 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${task.color}`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{task.progress}%</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    task.status === 'Done'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : task.status === 'Review'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}
                >
                  {task.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Velocity</span>
              <span className="text-xs text-emerald-400 font-semibold">+12% ↑</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[30, 50, 40, 70, 55, 80, 65, 90, 75, 95, 82, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 1.4 + i * 0.04, duration: 0.4, ease: 'easeOut' }}
                  className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/60 to-cyan-400/60"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating analytics cards */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-12 top-1/4 hidden lg:block"
      >
        <div className="glass rounded-2xl px-4 py-3 shadow-xl border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Productivity</p>
              <p className="text-sm font-bold text-white">+40%</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-10 bottom-1/4 hidden lg:block"
      >
        <div className="glass rounded-2xl px-4 py-3 shadow-xl border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Active Teams</p>
              <p className="text-sm font-bold text-white">10k+</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-8 top-12 hidden lg:block"
      >
        <div className="glass rounded-2xl px-4 py-3 shadow-xl border border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-bold text-white">97 pts</p>
            <span className="text-xs text-emerald-400">Team Score</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const { signInGuest } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await signInGuest();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
      
      <div className="relative w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20">
        <div className="flex flex-col gap-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-400">Nexus Platform</span>
              <div className="h-[1px] w-8 bg-blue-500/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">Smart project Management</span>
            </div>
            
            <h1 className="text-[10vw] sm:text-[9vw] lg:text-[7vw] font-black tracking-tighter leading-[0.85] text-white uppercase italic">
              Empower your <br /> <span className="gradient-text">Engineering</span> <br />
              <span className="text-slate-800">Potential</span>
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed font-medium tracking-tight">
              Nexus AI orchestrates your project workflows, 
              automates repetitive tasks, and provides deep insights 
              to keep your team focused on shipping high-quality code.
            </p>
          </motion.div>

          {/* CTA & Dashboard Preview */}
          <div className="grid lg:grid-cols-2 gap-20 items-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link
                to="/signup"
                className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button 
                onClick={handleDemo}
                disabled={demoLoading}
                className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-3 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
                  {demoLoading ? (
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                </div>
                {demoLoading ? 'Connecting...' : 'Try Demo Account'}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative group cursor-none"
            >
              <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative vertical rail */}
      <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-slate-900 hidden 2xl:block">
        <div className="absolute top-[20%] right-0 translate-x-1/2 flex flex-col gap-20 items-center">
          <div className="writing-vertical text-[10px] uppercase tracking-[0.5em] font-bold text-slate-700 italic">Core Protocol 001</div>
          <div className="w-1 h-20 bg-gradient-to-b from-blue-500 to-transparent" />
        </div>
      </div>
    </section>
  );
}
