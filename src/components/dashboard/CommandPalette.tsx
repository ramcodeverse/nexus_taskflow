import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Plus,
  Sun,
  Moon,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { useCommandStore } from '../../store/command';
import { useThemeStore } from '../../store/theme';
import { dataService } from '../../services/data';
import type { Project, Task } from '../../types';

interface CommandItem {
  id: string;
  group: 'pages' | 'projects' | 'tasks' | 'actions';
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

const GROUP_LABELS: Record<CommandItem['group'], string> = {
  pages: 'Pages',
  projects: 'Projects',
  tasks: 'Tasks',
  actions: 'Actions',
};

export default function CommandPalette() {
  const navigate = useNavigate();
  const { isOpen, close } = useCommandStore();
  const { theme, setTheme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      // Fetch data
      dataService.projects.list().then(res => setProjects(res ?? []));
      dataService.tasks.listByProject('all').then(res => setTasks(res ?? []));
    }
  }, [isOpen]);

  const go = useCallback(
    (path: string) => {
      close();
      navigate(path);
    },
    [close, navigate]
  );

  const staticItems: CommandItem[] = [
    { id: 'dashboard', group: 'pages', label: 'Dashboard', icon: LayoutDashboard, action: () => go('/dashboard'), keywords: 'home overview' },
    { id: 'projects', group: 'pages', label: 'Projects', icon: FolderKanban, action: () => go('/dashboard/projects'), keywords: 'project list' },
    { id: 'tasks', group: 'pages', label: 'Tasks', icon: CheckSquare, action: () => go('/dashboard/tasks'), keywords: 'task board' },
    { id: 'team', group: 'pages', label: 'Team', icon: Users, action: () => go('/dashboard/team'), keywords: 'members people' },
    { id: 'analytics', group: 'pages', label: 'Analytics', icon: BarChart3, action: () => go('/dashboard/analytics'), keywords: 'charts data stats' },
    { id: 'settings', group: 'pages', label: 'Settings', icon: Settings, action: () => go('/dashboard/settings'), keywords: 'preferences profile' },
    { id: 'new-project', group: 'actions', label: 'Create Project', description: 'Start a new project', icon: Plus, action: () => go('/dashboard/projects'), keywords: 'add new create project' },
    { id: 'new-task', group: 'actions', label: 'Create Task', description: 'Add a task', icon: Plus, action: () => go('/dashboard/tasks'), keywords: 'add new create task' },
    {
      id: 'toggle-theme',
      group: 'actions',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle color theme',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); close(); },
      keywords: 'theme dark light mode',
    },
  ];

  const projectItems: CommandItem[] = projects.map((p) => ({
    id: `project-${p.id}`,
    group: 'projects' as const,
    label: p.title,
    description: p.status,
    icon: FolderKanban,
    action: () => go(`/dashboard/projects/${p.id}`),
    keywords: p.title + ' ' + p.description,
  }));

  const taskItems: CommandItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    group: 'tasks' as const,
    label: t.title,
    description: t.status.replace('-', ' '),
    icon: Hash,
    action: () => go(`/dashboard/tasks`),
    keywords: t.title + ' ' + t.description,
  }));

  const allItems = [...staticItems, ...projectItems, ...taskItems];

  const filtered = query
    ? allItems.filter(
        (item) =>
          fuzzyMatch(query, item.label) ||
          (item.keywords && fuzzyMatch(query, item.keywords)) ||
          (item.description && fuzzyMatch(query, item.description))
      )
    : staticItems;

  const grouped = filtered.reduce<Record<CommandItem['group'], CommandItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    { pages: [], projects: [], tasks: [], actions: [] }
  );

  const flatFiltered = [
    ...grouped.pages,
    ...grouped.projects,
    ...grouped.tasks,
    ...grouped.actions,
  ].filter((item) => item !== undefined);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatFiltered[selected]?.action();
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const renderGroup = (groupId: CommandItem['group']) => {
    const items = grouped[groupId];
    if (!items?.length) return null;

    const itemIndex = flatFiltered.indexOf(items[0]);

    return (
      <div key={groupId} className="mb-2">
        <p className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
          {GROUP_LABELS[groupId]}
        </p>
        {items.map((item, i) => {
          const idx = itemIndex + i;
          const isSelected = idx === selected;
          return (
            <button
              key={item.id}
              data-idx={idx}
              onClick={() => item.action()}
              onMouseEnter={() => setSelected(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600/20' : 'bg-[var(--color-surface-tertiary)]'}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate capitalize">{item.description}</p>
                )}
              </div>
              {isSelected && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-xl glass-strong rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
              <Search className="w-5 h-5 text-[var(--color-text-tertiary)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, projects, tasks..."
                className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none text-sm"
              />
              <kbd className="hidden sm:flex px-1.5 py-0.5 rounded text-xs border border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="p-2 max-h-96 overflow-y-auto">
              {flatFiltered.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--color-text-secondary)] text-sm">No results for "{query}"</p>
                </div>
              ) : (
                <>
                  {renderGroup('pages')}
                  {renderGroup('projects')}
                  {renderGroup('tasks')}
                  {renderGroup('actions')}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)]">↑</kbd>
                <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)]">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)]">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1 ml-auto">
                {flatFiltered.length} results
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
