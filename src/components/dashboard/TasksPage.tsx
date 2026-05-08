import { useEffect, useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { dataService } from '../../services/data';
import type { Task } from '../../types';
import TaskBoard from './TaskBoard';
import Skeleton from '../shared/Skeleton';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const allTasks = await dataService.tasks.listByProject('all');
      setTasks(allTasks ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton variant="card" className="h-[600px]" />
          <Skeleton variant="card" className="h-[600px]" />
          <Skeleton variant="card" className="h-[600px]" />
          <Skeleton variant="card" className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">All Tasks</h1>
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold mt-0.5">
                Centralized Task Orchestration
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500/50 transition-all w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[var(--color-surface-secondary)] p-1 rounded-xl border border-[var(--color-border)]">
              {(['all', 'todo', 'in-progress', 'review', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <TaskBoard
          projectId="all"
          tasks={filteredTasks}
          onTasksChange={setTasks}
        />
      </div>
    </div>
  );
}
