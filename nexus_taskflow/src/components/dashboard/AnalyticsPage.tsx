import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, CheckCircle2, FolderKanban, Users } from 'lucide-react';
import { dataService } from '../../services/data';
import Skeleton from '../shared/Skeleton';

interface TaskCompletionData {
  week: string;
  completed: number;
  created: number;
}

interface ProjectProgressData {
  name: string;
  value: number;
  color: string;
}

interface TeamProductivityData {
  day: string;
  [key: string]: string | number;
}

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const;
type DateRange = (typeof DATE_RANGES)[number];

const PIE_COLORS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b'];

function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-6 border border-[var(--color-border)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="text-3xl font-bold text-[var(--color-text)] mb-1">{value}</div>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-xs text-emerald-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('Last 30 days');
  const [loading, setLoading] = useState(true);
  const [taskCompletion, setTaskCompletion] = useState<TaskCompletionData[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgressData[]>([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, totalProjects: 0, teamMembers: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [projectsData, tasksData] = await Promise.all([
      dataService.projects.list(),
      dataService.tasks.listByProject('all'),
    ]);

    const projects = projectsData ?? [];
    const tasks = tasksData ?? [];

    setStats({
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      totalProjects: projects.length,
      teamMembers: 4,
    });

    const days = dateRange === 'Last 7 days' ? 7 : dateRange === 'Last 30 days' ? 30 : 90;

    // Build weekly task completion data
    const weeks: TaskCompletionData[] = [];
    const numWeeks = Math.ceil(days / 7);
    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const weekTasks = tasks.filter((t) => {
        const d = new Date(t.created_at);
        return d >= weekStart && d < weekEnd;
      });
      weeks.push({
        week: `W${numWeeks - i}`,
        created: weekTasks.length,
        completed: weekTasks.filter((t) => t.status === 'completed').length,
      });
    }
    setTaskCompletion(weeks);

    // Project status distribution
    const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    setProjectProgress([
      { name: 'Active', value: statusCounts['active'] || 0, color: PIE_COLORS[0] },
      { name: 'On Hold', value: statusCounts['on-hold'] || 0, color: PIE_COLORS[1] },
      { name: 'Completed', value: statusCounts['completed'] || 0, color: PIE_COLORS[2] },
      { name: 'Archived', value: statusCounts['archived'] || 0, color: PIE_COLORS[3] },
    ]);

    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // Fake team productivity data
  const teamProductivity: TeamProductivityData[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    Alice: Math.floor(Math.random() * 8) + 2,
    Bob: Math.floor(Math.random() * 6) + 1,
    Carol: Math.floor(Math.random() * 7) + 2,
  }));

  const tooltipStyle = {
    background: 'var(--color-surface-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    color: 'var(--color-text)',
    fontSize: '12px',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Analytics</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Track your team's performance</p>
        </div>
        <div className="flex rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-1 gap-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle2} label="Tasks Completed" value={stats.completedTasks} sub={`${completionRate}% completion rate`} color="#10b981" delay={0} />
          <StatCard icon={FolderKanban} label="Active Projects" value={stats.totalProjects} color="#3b82f6" delay={0.1} />
          <StatCard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} color="#0ea5e9" delay={0.2} />
          <StatCard icon={Users} label="Team Members" value={stats.teamMembers} color="#f59e0b" delay={0.3} />
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task completion bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">Task Completion</h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Weekly created vs completed</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-500" />Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-cyan-400" />Completed</span>
            </div>
          </div>
          {loading ? <Skeleton variant="chart" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskCompletion} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="created" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Project status pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <h2 className="font-semibold text-[var(--color-text)] mb-6">Project Status</h2>
          {loading ? <Skeleton variant="chart" /> : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={projectProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectProgress.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {projectProgress.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-[var(--color-text-secondary)]">{p.name}</span>
                    </div>
                    <span className="text-[var(--color-text)] font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Team productivity line chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6 border border-[var(--color-border)]"
      >
        <div className="mb-6">
          <h2 className="font-semibold text-[var(--color-text)]">Team Productivity</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Tasks completed per team member this week</p>
        </div>
        {loading ? <Skeleton variant="chart" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={teamProductivity} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="aliceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bobGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="carolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
              />
              <Area type="monotone" dataKey="Alice" stroke="#3b82f6" strokeWidth={2} fill="url(#aliceGrad)" />
              <Area type="monotone" dataKey="Bob" stroke="#0ea5e9" strokeWidth={2} fill="url(#bobGrad)" />
              <Area type="monotone" dataKey="Carol" stroke="#10b981" strokeWidth={2} fill="url(#carolGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
