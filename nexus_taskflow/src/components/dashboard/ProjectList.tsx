import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FolderKanban,
  Calendar,
  ArrowUpRight,
  X,
  ChevronDown,
} from 'lucide-react';
import { dataService } from '../../services/data';
import { useAuthStore } from '../../store/auth';
import type { Project } from '../../types';
import EmptyState from '../shared/EmptyState';
import Skeleton from '../shared/Skeleton';
import { formatDate } from '../../lib/utils';

const STATUS_COLORS: Record<Project['status'], string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'on-hold': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const PRIORITY_COLORS: Record<Project['priority'], string> = {
  low: 'bg-slate-500/15 text-slate-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
};

const PROJECT_COLORS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
  userId: string;
}

function CreateProjectModal({ onClose, onCreate, userId }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('active');
  const [priority, setPriority] = useState<Project['priority']>('medium');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      const projectData = await dataService.projects.create({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        color,
        deadline: deadline || null,
        created_by: userId,
      });
      if (projectData) {
        onCreate(projectData);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg glass-strong rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Create Project</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Project Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-10"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Project['priority'])}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface-secondary)] ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)] transition-all text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors glow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await dataService.projects.list();
    setProjects(data ?? []);
    setLoading(false);
  };

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Projects</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">{projects.length} projects total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors glow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
          </div>
          <div className="flex rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          description={
            search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Create your first project to start organizing your work.'
          }
          action={
            !search && statusFilter === 'all'
              ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  Create Project
                </button>
              )
              : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              className="glass rounded-2xl p-6 border border-[var(--color-border)] hover:border-blue-500/30 cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${project.color}20` }}
                >
                  <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${STATUS_COLORS[project.status]}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-1">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority}
                </span>
                {project.deadline && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.deadline)}
                  </div>
                )}
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 60 + 20}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: project.color }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ x: 4 }}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              className="glass rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-blue-500/30 cursor-pointer group transition-all flex items-center gap-4"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${project.color}20` }}
              >
                <FolderKanban className="w-4 h-4" style={{ color: project.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--color-text)] text-sm truncate">{project.title}</h3>
                {project.description && (
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">{project.description}</p>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${STATUS_COLORS[project.status]}`}>
                  {project.status.replace('-', ' ')}
                </span>
                {project.deadline && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.deadline)}
                  </div>
                )}
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && user && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={(project) => setProjects((prev) => [project, ...prev])}
            userId={user.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
