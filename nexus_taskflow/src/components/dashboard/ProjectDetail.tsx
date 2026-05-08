import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FolderKanban, CreditCard as Edit2, Trash2, Users, CheckSquare, Activity, Settings, Calendar } from 'lucide-react';
import { dataService } from '../../services/data';
import type { Project, Task, ProjectMember, ActivityLog } from '../../types';
import Skeleton from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import TaskBoard from './TaskBoard';
import { formatDate, formatRelativeTime, getInitials, cn } from '../../lib/utils';

import { nexusAI } from '../../lib/gemini';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type Tab = (typeof TABS)[number]['id'];

const STATUS_COLORS: Record<Project['status'], string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'on-hold': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

import { LayoutDashboard, Brain, Sparkles, Loader2, X } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ title: '', description: '', deadline: '' });

  const getAiInsight = async () => {
    if (aiLoading || !project) return;
    setAiLoading(true);
    try {
      const taskList = tasks.map(t => `- ${t.title} (${t.status}, priority: ${t.priority})`).join('\n');
      const prompt = `Analyze this project and provide a concise, professional assessment.
      Project: ${project.title}
      Description: ${project.description}
      Deadline: ${project.deadline}
      Tasks:\n${taskList}
      
      Suggest the next 3 priority actions and identify potential bottlenecks. Keep it actionable.`;

      const result = await nexusAI.chat([{ role: 'user', content: prompt }], 'You are a professional project management consultant.');
      setAiInsight(result.text || "Failed to generate insight.");
      setActiveTab('overview');
    } catch (error) {
      console.error('AI Insight error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [projectRes, tasksRes, membersRes, activityRes] = await Promise.all([
        dataService.projects.get(id),
        dataService.tasks.listByProject(id),
        dataService.members.listByProject(id),
        dataService.activity.listByProject(id),
      ]);
      if (projectRes) {
        setProject(projectRes);
        setSettingsForm({ title: projectRes.title, description: projectRes.description || '', deadline: projectRes.deadline || '' });
      }
      setTasks(tasksRes ?? []);
      setMembers(membersRes ?? []);
      setActivity(activityRes ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!project || !window.confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(true);
    await dataService.projects.delete(project.id);
    navigate('/dashboard/projects');
  };

  const handleSaveSettings = async () => {
    if (!project) return;
    const data = await dataService.projects.update(project.id, {
      title: settingsForm.title,
      description: settingsForm.description,
      deadline: settingsForm.deadline || null,
    });
    if (data) setProject(data);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton variant="text" lines={2} className="max-w-sm" />
        <Skeleton variant="card" />
        <Skeleton variant="chart" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState 
          icon={FolderKanban} 
          title="Project not found" 
          description="This project may have been deleted." 
          action={
            <button 
              onClick={() => navigate('/dashboard/projects')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Back to Projects
            </button>
          } 
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/30 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${project.color}20` }}
            >
              <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">{project.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${STATUS_COLORS[project.status]}`}>
                  {project.status.replace('-', ' ')}
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.deadline)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getAiInsight}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg glow disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              AI Inspect
            </motion.button>
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        {project.description && (
          <p className="text-[var(--color-text-secondary)] text-sm mt-3 ml-16 hidden sm:block">{project.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4 border-b border-[var(--color-border)] flex-shrink-0">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all relative ${
              activeTab === tabId
                ? 'text-blue-400'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === tabId && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'overview' && (
              <div className="p-6 space-y-8 max-w-5xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: 'Progress', value: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%`, sub: 'Overall Completion' },
                    { label: 'Active Tasks', value: tasks.filter(t => t.status !== 'completed').length, sub: 'Currently in Pipeline' },
                    { label: 'Team Velocity', value: members.length, sub: 'Active Collaborators' },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-[var(--color-border)]">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-tertiary)] mb-1">{stat.label}</div>
                      <div className="text-3xl font-black text-blue-500 tracking-tighter">{stat.value}</div>
                      <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{stat.sub}</div>
                    </div>
                  ))}
                </div>

                {/* AI Insight Section */}
                <AnimatePresence>
                  {aiInsight && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-indigo-600/5 blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
                      <div className="relative glass-strong p-8 rounded-3xl border border-indigo-500/20 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl glow">
                              <Brain className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-[var(--color-text)]">Nexus AI Insight</h3>
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Autonomous Analysis Complete</p>
                            </div>
                          </div>
                          <button onClick={() => setAiInsight(null)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap italic">
                            {aiInsight}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-indigo-500/10 text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Optimization Recommendations Ready
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Board Summary */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest px-1">Pipeline Snapshot</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", 
                            task.status === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-blue-500 animate-pulse"
                          )} />
                          <span className="text-sm font-medium text-[var(--color-text)]">{task.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">{task.status}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('tasks')} className="text-xs text-blue-500 font-bold hover:underline px-1">VIEW FULL TASKBOARD →</button>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <TaskBoard
                projectId={project.id}
                tasks={tasks}
                onTasksChange={setTasks}
              />
            )}

            {activeTab === 'team' && (
              <div className="p-6 max-w-2xl">
                {members.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No team members"
                    description="Invite people to collaborate on this project."
                    action={
                      <button
                        onClick={() => navigate('/dashboard/team')}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                      >
                        Invite Member
                      </button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {members.map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 glass rounded-xl border border-[var(--color-border)]"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {member.profile?.avatar_url ? (
                            <img src={member.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(member.profile?.full_name || 'U')
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--color-text)] text-sm">{member.profile?.full_name}</p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">Joined {formatDate(member.joined_at)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${member.role === 'admin' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-500/15 text-slate-400'}`}>
                          {member.role}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6 max-w-2xl">
                {activity.length === 0 ? (
                  <EmptyState icon={Activity} title="No activity yet" description="Actions taken on this project will appear here." />
                ) : (
                  <div className="space-y-4">
                    {activity.map((log, i) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400 mt-0.5">
                          {(log.profile?.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 glass rounded-xl p-3 border border-[var(--color-border)]">
                          <p className="text-sm text-[var(--color-text)]">
                            <span className="font-medium">{log.profile?.full_name || 'Someone'}</span>{' '}
                            {log.action}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{formatRelativeTime(log.created_at)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6 max-w-lg">
                <div className="glass rounded-2xl p-6 border border-[var(--color-border)] space-y-5">
                  <h3 className="font-semibold text-[var(--color-text)]">Project Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Title</label>
                    <input
                      value={settingsForm.title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Description</label>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Deadline</label>
                    <input
                      type="date"
                      value={settingsForm.deadline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors glow-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
