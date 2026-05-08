import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  Users,
  Plus,
  UserPlus,
  Clock,
  AlertCircle,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/auth';
import { dataService } from '../../services/data';
import type { DashboardStats, ActivityLog, Task } from '../../types';
import Skeleton from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { formatRelativeTime, formatDate, cn } from '../../lib/utils';

const productivityData = [
  { day: 'Mon', tasks: 4, completed: 3 },
  { day: 'Tue', tasks: 7, completed: 5 },
  { day: 'Wed', tasks: 5, completed: 5 },
  { day: 'Thu', tasks: 9, completed: 6 },
  { day: 'Fri', tasks: 6, completed: 6 },
  { day: 'Sat', tasks: 3, completed: 2 },
  { day: 'Sun', tasks: 2, completed: 2 },
];

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
    const [projectsData, tasksData, activityData] = await Promise.all([
          dataService.projects.list(),
          dataService.tasks.listByProject('all'),
          dataService.activity.listByProject('all'),
        ]);

        const projects = projectsData ?? [];
        const tasks = tasksData ?? [];
        const activityLog = activityData ?? [];

        // Simple stats calculation from projects list
        setStats({
          totalProjects: projects.length,
          activeTasks: tasks.filter(t => t.status === 'in-progress').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          teamMembers: 4,
          overdueTasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
          completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
        });
        setActivity(activityLog);
        setUpcomingTasks(tasks.filter(t => t.due_date && new Date(t.due_date) > new Date()).slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const statCards = stats
    ? [
        { icon: FolderKanban, label: 'Total Projects', value: stats.totalProjects, trend: 12, color: '#3b82f6' },
        { icon: CheckSquare, label: 'Active Tasks', value: stats.activeTasks, trend: -5, color: '#f59e0b' },
        { icon: CheckCircle2, label: 'Completed Tasks', value: stats.completedTasks, trend: 18, color: '#10b981' },
        { icon: Users, label: 'Team Members', value: stats.teamMembers, trend: 8, color: '#0ea5e9' },
      ]
    : [];

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--color-border)] pb-8"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded">System Alpha</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[var(--color-text-tertiary)] flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Nexus Active
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-[var(--color-text)] leading-[0.9]">
            HELLO, <span className="gradient-text italic">{firstName.toUpperCase()}</span>
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-tertiary)] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3 h-3" />
              {stats?.totalProjects || 0} ACTIVE NODES
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/projects')}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all glow overflow-hidden rounded-sm"
          >
            <div className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Initialize Project
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full duration-1000 -translate-x-full transition-transform" />
          </motion.button>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--color-border)] border border-[var(--color-border)] overflow-hidden rounded-sm">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] p-8 h-40">
              <Skeleton variant="text" lines={2} />
            </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--color-surface)] p-8 group hover:bg-[var(--color-surface-secondary)] transition-colors relative h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <card.icon className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-blue-500 transition-colors" />
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded border tracking-tighter",
                  card.trend >= 0 ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-red-500 border-red-500/20 bg-red-500/5"
                )}>
                  {card.trend >= 0 ? '+' : ''}{card.trend}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-[var(--color-text)] tracking-tighter">
                  <AnimatedCounter value={card.value} />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                  {card.label}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))
        )}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">Weekly Productivity</h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Tasks created vs completed</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Created
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Completed
              </span>
            </div>
          </div>
          {loading ? (
            <Skeleton variant="chart" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productivityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTasks)" />
                <Area type="monotone" dataKey="completed" stroke="#38bdf8" strokeWidth={2} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Recent Activity
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="avatar" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Actions you and your team take will appear here."
            />
          ) : (
            <div className="space-y-4">
              {activity.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400 mt-0.5">
                    {(log.profile?.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text)] leading-relaxed">
                      <span className="font-medium">{log.profile?.full_name || 'Someone'}</span>{' '}
                      {log.action}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming deadlines + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Upcoming Deadlines
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="All caught up!"
              description="No upcoming deadlines. Great work!"
            />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task, i) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/tasks`)}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text)] truncate">{task.title}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-[var(--color-text-tertiary)]'}`}>
                      {isOverdue && <AlertCircle className="w-3 h-3" />}
                      {formatDate(task.due_date || new Date())}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                icon: FolderKanban,
                label: 'Create Project',
                desc: 'Start a new project',
                color: '#3b82f6',
                action: () => navigate('/dashboard/projects'),
              },
              {
                icon: CheckSquare,
                label: 'Create Task',
                desc: 'Add a task to a project',
                color: '#0ea5e9',
                action: () => navigate('/dashboard/tasks'),
              },
              {
                icon: UserPlus,
                label: 'Invite Member',
                desc: 'Add someone to your team',
                color: '#10b981',
                action: () => navigate('/dashboard/team'),
              },
            ].map(({ icon: Icon, label, desc, color, action }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={action}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-surface-secondary)] transition-all text-left border border-transparent hover:border-[var(--color-border)] group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
