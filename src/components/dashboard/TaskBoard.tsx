import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flag, Calendar, GripVertical } from 'lucide-react';
import { dataService } from '../../services/data';
import type { Task } from '../../types';
import TaskModal from './TaskModal';
import { formatDate, getInitials } from '../../lib/utils';

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo', label: 'Todo', color: '#64748b' },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review', label: 'Review', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', color: '#10b981' },
];

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-slate-500/15 text-slate-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
};

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onClick: (task: Task) => void;
  key?: React.Key;
  // key is handled by React, but tsc sometimes complains in object literal contexts
}

function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
      onClick={() => onClick(task)}
      className="glass rounded-xl p-4 border border-[var(--color-border)] cursor-pointer hover:border-blue-500/30 transition-all group select-none"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text)] leading-snug line-clamp-2">{task.title}</p>
        </div>
        <GripVertical className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 cursor-grab" />
      </div>

      {task.description && (
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${PRIORITY_COLORS[task.priority]}`}>
          <span className="flex items-center gap-1">
            <Flag className="w-2.5 h-2.5" />
            {task.priority}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-[var(--color-text-tertiary)]'}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
          {task.assignee && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {task.assignee.avatar_url ? (
                <img src={task.assignee.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(task.assignee.full_name)
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function TaskBoard({ projectId, tasks, onTasksChange }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [creatingInColumn, setCreatingInColumn] = useState<Task['status'] | null>(null);
  const [dragOver, setDragOver] = useState<Task['status'] | null>(null);
  const dragTaskId = useRef<string>('');

  const handleDragStart = (_e: React.DragEvent, taskId: string) => {
    dragTaskId.current = taskId;
  };

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOver(status);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    setDragOver(null);
    const taskId = dragTaskId.current;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    onTasksChange(updated);

    await dataService.tasks.updateStatus(task.project_id, taskId, newStatus);
    dragTaskId.current = '';
  };

  const handleDragLeave = () => setDragOver(null);

  const handleTaskSave = (saved: Task) => {
    const exists = tasks.find((t) => t.id === saved.id);
    if (exists) {
      onTasksChange(tasks.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      onTasksChange([...tasks, saved]);
    }
    setSelectedTask(null);
    setCreatingInColumn(null);
  };

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 p-6 min-w-max h-full">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isDragTarget = dragOver === col.id;

          return (
            <div
              key={col.id}
              className="flex flex-col w-72 flex-shrink-0"
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={handleDragLeave}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-semibold text-[var(--color-text)]">{col.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setCreatingInColumn(col.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column body */}
              <motion.div
                animate={{
                  background: isDragTarget
                    ? `${col.color}08`
                    : 'transparent',
                  borderColor: isDragTarget
                    ? `${col.color}30`
                    : 'transparent',
                }}
                className="flex-1 rounded-2xl border-2 border-dashed border-transparent min-h-[200px] space-y-3 p-2 transition-colors overflow-y-auto"
              >
                <AnimatePresence>
                  {colTasks.length === 0 && !isDragTarget && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-[var(--color-border)]"
                    >
                      <p className="text-xs text-[var(--color-text-tertiary)]">No tasks</p>
                    </motion.div>
                  )}
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onClick={setSelectedTask}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Add task button */}
              <button
                onClick={() => setCreatingInColumn(col.id)}
                className="mt-3 w-full py-2 rounded-xl border border-dashed border-[var(--color-border)] hover:border-blue-500/40 text-[var(--color-text-tertiary)] hover:text-blue-400 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add task
              </button>
            </div>
          );
        })}
      </div>

      {/* Task modal */}
      <AnimatePresence>
        {(selectedTask || creatingInColumn !== null) && (
          <TaskModal
            task={selectedTask}
            projectId={projectId}
            defaultStatus={creatingInColumn || 'todo'}
            onClose={() => {
              setSelectedTask(null);
              setCreatingInColumn(null);
            }}
            onSave={handleTaskSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
