import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, ChevronDown, Calendar, User, Flag } from 'lucide-react';
import { dataService } from '../../services/data';
import { useAuthStore } from '../../store/auth';
import type { Task, Comment, Profile, Project } from '../../types';
import { formatRelativeTime, getInitials } from '../../lib/utils';

interface TaskModalProps {
  task?: Task | null;
  projectId: string;
  defaultStatus?: Task['status'];
  onClose: () => void;
  onSave: (task: Task) => void;
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'text-slate-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function TaskModal({ task, projectId, defaultStatus = 'todo', onClose, onSave }: TaskModalProps) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || defaultStatus);
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) || '');
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [members, setMembers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(task?.project_id || (projectId === 'all' ? '' : projectId));

  useEffect(() => {
    dataService.members.listAll().then(res => setMembers(res ?? []));
    dataService.projects.list().then(res => setProjects(res ?? []));

    if (task?.id) {
      dataService.comments.listByTask(task.project_id, task.id).then(res => setComments(res ?? []));
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (projectId === 'all' && !selectedProjectId) { setError('Please select a project'); return; }
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // Mock save for now
      const savedTask = {
        ...task,
        id: task?.id || Math.random().toString(36).substr(2, 9),
        project_id: selectedProjectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
        created_by: task?.created_by || user.id,
        created_at: task?.created_at || new Date().toISOString(),
      } as Task;
      onSave(savedTask);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user || !task?.id) return;
    setSendingComment(true);
    const data = await dataService.comments.create(task.project_id, task.id, {
      task_id: task.id,
      user_id: user.id,
      content: newComment.trim()
    });
    if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment('');
    }
    setSendingComment(false);
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
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl glass-strong rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-0 py-2 bg-transparent border-b border-[var(--color-border)] focus:border-blue-500 text-[var(--color-text)] text-lg font-medium placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {projectId === 'all' && (
                <div className="col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                    Project
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 appearance-none pr-8 text-sm"
                    >
                      <option value="">Select a project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className={`w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-8 text-sm font-medium ${PRIORITY_COLORS[priority]}`}
                  >
                    <option value="low" className="text-[var(--color-text)]">Low</option>
                    <option value="medium" className="text-[var(--color-text)]">Medium</option>
                    <option value="high" className="text-[var(--color-text)]">High</option>
                    <option value="urgent" className="text-[var(--color-text)]">Urgent</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-8 text-sm"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  <User className="w-3.5 h-3.5" /> Assignee
                </label>
                <div className="relative">
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-8 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all text-sm font-medium">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors glow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  task ? 'Save Changes' : 'Create Task'
                )}
              </button>
            </div>
          </form>

          {/* Comments (only for existing tasks) */}
          {task?.id && (
            <div className="px-6 pb-6 border-t border-[var(--color-border)] pt-5">
              <h3 className="font-medium text-[var(--color-text)] text-sm mb-4">Comments ({comments.length})</h3>
              <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)] text-sm">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                        {getInitials(comment.profile?.full_name || 'U')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[var(--color-text)]">{comment.profile?.full_name}</span>
                          <span className="text-xs text-[var(--color-text-tertiary)]">{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment())}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  onClick={handleComment}
                  disabled={sendingComment || !newComment.trim()}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
                >
                  {sendingComment ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
