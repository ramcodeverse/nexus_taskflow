import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Zap,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Circle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useThemeStore } from '../../store/theme';
import { useCommandStore } from '../../store/command';
import { getInitials } from '../../lib/utils';
import type { Notification } from '../../types';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/dashboard/team', icon: Users, label: 'Team' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

import NexusAssistant from './NexusAssistant';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { open: openCommand } = useCommandStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock notifications for now
    if (user) {
      setNotifications([
        { 
          id: '1', 
          title: 'Welcome to Nexus', 
          message: 'Your autonomous task orchestration is ready.', 
          type: 'info',
          read: false, 
          created_at: new Date().toISOString(), 
          user_id: user.id 
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommand();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCommand]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${!mobile && collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-[var(--color-text)] text-sm whitespace-nowrap overflow-hidden uppercase italic tracking-tighter"
            >
              Nexus <span className="text-blue-500">TaskFlow</span>
            </motion.span>
          )}
        </AnimatePresence>
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                collapsed && !mobile ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                <AnimatePresence>
                  {(!collapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && !mobile && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-[var(--color-surface-tertiary)] text-[var(--color-text)] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`px-3 pb-4 ${collapsed && !mobile ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--color-surface)] dark overflow-hidden">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-[var(--color-surface-secondary)] border-r border-[var(--color-border)] relative flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-blue-500/50 transition-all shadow-lg z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-surface-secondary)] border-r border-[var(--color-border)] z-50 flex flex-col"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search trigger */}
          <button
            onClick={openCommand}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-blue-500/40 hover:text-[var(--color-text-secondary)] transition-all text-sm flex-1 max-w-xs group"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left hidden sm:block">Search...</span>
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border border-[var(--color-border)] text-[var(--color-text-tertiary)] group-hover:border-blue-500/30 transition-colors">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl border border-[var(--color-border)] shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[var(--color-border)]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--color-text)] text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-blue-400">{unreadCount} new</span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-text-tertiary)] text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-[var(--color-border)] last:border-0 ${!n.read ? 'bg-blue-500/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <Circle
                                className={`w-2 h-2 mt-1.5 flex-shrink-0 ${!n.read ? 'text-blue-400 fill-blue-400' : 'text-transparent'}`}
                              />
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text)]">{n.title}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl p-1">
              {themeOptions.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    theme === value
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* User avatar */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  getInitials(user?.full_name || 'U')
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl border border-[var(--color-border)] shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[var(--color-border)]">
                      <p className="font-semibold text-[var(--color-text)] text-sm">{user?.full_name}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 capitalize">{user?.role}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/dashboard/settings'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-all"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        <NexusAssistant />
      </div>
    </div>
  );
}
