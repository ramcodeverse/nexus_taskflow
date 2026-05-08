import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Sun, Moon, Monitor, Bell, BellOff, Save, Check, Shield, Database, Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useThemeStore } from '../../store/theme';
import { getInitials } from '../../lib/utils';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const isAdmin = user?.email === 'ram@codverse3.com' || user?.role === 'admin';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    projectUpdates: true,
    teamInvites: true,
    weeklyDigest: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    // Mock save logic
    await new Promise(r => setTimeout(r, 1000));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    // Mock avatar change
    setError('Avatars are currently in read-only mode during autonomous deployment.');
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean, bright interface' },
    { value: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
    { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Match system preference' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-[var(--color-border)]"
      >
        <h2 className="font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.full_name || 'U')
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">{user?.full_name}</p>
            <p className="text-sm text-[var(--color-text-secondary)] capitalize">{user?.role}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              Change avatar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
              <input
                value={user?.id ? `(from auth)` : ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                placeholder="Email managed by authentication"
              />
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Email is managed through your authentication provider.</p>
          </div>

          <div className="flex justify-end pt-2">
            <motion.button
              onClick={handleSaveProfile}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors glow-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-[var(--color-border)]"
      >
        <h2 className="font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Sun className="w-4 h-4 text-blue-400" />
          Appearance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === value
                  ? 'border-blue-500/50 bg-blue-600/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${theme === value ? 'bg-blue-600/20' : 'bg-[var(--color-surface-tertiary)]'}`}>
                <Icon className={`w-5 h-5 ${theme === value ? 'text-blue-400' : 'text-[var(--color-text-secondary)]'}`} />
              </div>
              <p className={`text-sm font-medium ${theme === value ? 'text-blue-400' : 'text-[var(--color-text)]'}`}>{label}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-[var(--color-border)]"
      >
        <h2 className="font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          Notifications
        </h2>

        <div className="space-y-4">
          {[
            { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
            { key: 'projectUpdates', label: 'Project Updates', desc: 'Status changes and milestone completions' },
            { key: 'teamInvites', label: 'Team Invites', desc: 'When you are invited to a project' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of activity every week' },
          ].map(({ key, label, desc }) => {
            const isOn = notifications[key as keyof typeof notifications];
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isOn ? 'bg-blue-600' : 'bg-[var(--color-surface-tertiary)]'}`}
                >
                  <motion.div
                    animate={{ x: isOn ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4">
          <button
            onClick={() => setNotifications({ taskAssigned: false, projectUpdates: false, teamInvites: false, weeklyDigest: false })}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
          >
            <BellOff className="w-4 h-4" />
            Disable all notifications
          </button>
        </div>
      </motion.div>

      {/* Admin Section */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5"
        >
          <h2 className="font-semibold text-amber-400 mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Admin System Control
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Global Monitoring</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">You have superuser access to all teams and projects.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] opacity-60 grayscale cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">System Logs</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Access raw audit trails and system performance.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Coming Soon
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest text-center">
              Nexus Master Privilege: Authorized to {user?.email}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
