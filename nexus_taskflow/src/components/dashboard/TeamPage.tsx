import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, ShieldCheck, Plus, Link as LinkIcon, LogOut, Trash2, Key, Loader2, Sparkles, Check, Copy, Timer, RefreshCcw, ChevronRight } from 'lucide-react';
import { dataService } from '../../services/data';
import { auth } from '../../lib/firebase';
import type { Team, TeamMember } from '../../types';
import Skeleton from '../shared/Skeleton';
import InviteCodeInput from '../team/InviteCodeInput';
import { getInitials, formatDate, cn } from '../../lib/utils';

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMode, setInviteMode] = useState<'join' | 'create'>('join');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const isAdmin = auth.currentUser?.email === 'ramcodeverse@gmail.com';

  const calculateTimeLeft = useCallback(() => {
    if (!activeTeam?.invite?.expires_at) return '';
    const expiry = new Date(activeTeam.invite.expires_at).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'EXPIRED';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }, [activeTeam]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTeams = isAdmin ? await dataService.teams.listAll() : await dataService.teams.list();
      setTeams(fetchedTeams || []);
      if (fetchedTeams && fetchedTeams.length > 0) {
        if (!activeTeam) {
          setActiveTeam(fetchedTeams[0]);
        } else {
          const updated = fetchedTeams.find(t => t.id === activeTeam.id);
          if (updated) setActiveTeam(updated);
        }
      }
    } catch (err) {
      console.error('Load teams error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, activeTeam]);

  const loadMembers = useCallback(async (teamId: string) => {
    try {
      const teamMembers = await dataService.teams.getMembers(teamId);
      setMembers(teamMembers || []);
    } catch (err) {
      console.error('Load members error:', err);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTeam) {
      loadMembers(activeTeam.id);
    }
  }, [activeTeam, loadMembers]);

  const handleCreateTeam = async () => {
    setActionLoading(true);
    setError('');
    try {
      const newTeam = await dataService.teams.create(teamName || 'Nexus Workspace');
      if (newTeam) {
        setActiveTeam(newTeam);
        await loadTeams();
        setShowInviteModal(false);
        setTeamName('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create team';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (inviteCode.length < 6) return;
    setActionLoading(true);
    setError('');
    try {
      const team = await dataService.teams.join(inviteCode);
      if (team) {
        setActiveTeam(team);
        await loadTeams();
        setShowInviteModal(false);
        setInviteCode('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateInvite = async () => {
    if (!activeTeam) return;
    setActionLoading(true);
    try {
      const updated = await dataService.teams.regenerateInvite(activeTeam.id);
      if (updated) setActiveTeam(updated);
    } catch (err) {
      console.error('Regenerate invite error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeTeam?.invite?.code) return;
    navigator.clipboard.writeText(activeTeam.invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeTeam) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await dataService.teams.removeMember(activeTeam.id, memberId);
      await loadMembers(activeTeam.id);
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  const isLeader = activeTeam?.created_by === auth.currentUser?.uid || isAdmin;

  if (loading && teams.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton variant="text" className="w-48 h-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--color-text)] tracking-tight">Force Manifest</h1>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] font-black mt-0.5">
              {isAdmin ? 'System Administrator Access' : activeTeam?.name || 'Selection Required'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {teams.length > 0 && (
            <select
              value={activeTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                if (team) setActiveTeam(team);
              }}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:border-blue-500/30"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={() => {
              setInviteMode('join');
              setShowInviteModal(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group active:scale-95"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Invite Core
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-32 glass rounded-[2rem] border border-dashed border-[var(--color-border)] mesh-gradient relative overflow-hidden group">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" 
          />
          <Users className="w-16 h-16 text-blue-500/20 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[var(--color-text)] tracking-tight">No Active Workspaces</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mx-auto mt-3 leading-relaxed">
            You are currently drifting between zones. Initializing a workspace or connecting via invite is required to access Nexus infrastructure.
          </p>
          <button 
            onClick={() => {
              setInviteMode('create');
              setShowInviteModal(true);
            }}
            className="mt-10 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 mx-auto active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Initialize Workspace
          </button>
        </div>
      ) : (
        <>
          {/* Advanced Invite Panel (Lead Only) */}
          {activeTeam && isLeader && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 glass rounded-[2rem] p-8 border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 p-24 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Key className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Authorized Management Zone</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                      <h2 className="text-4xl font-black text-[var(--color-text)] tracking-tight mb-2 uppercase italic">{activeTeam.name}</h2>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-black text-[var(--color-text-secondary)]">{members.length} MEMBERS</span>
                        </div>
                        <div className="h-4 w-px bg-[var(--color-border)]" />
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            timeLeft === 'EXPIRED' ? "bg-red-500" : "bg-emerald-500"
                          )} />
                          <span className="text-[10px] font-black uppercase text-[var(--color-text-tertiary)] tracking-widest">Server Synchronized</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group/invite">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover/invite:opacity-50 transition duration-1000 group-hover/invite:duration-200"></div>
                        <div className="relative p-6 bg-slate-950 rounded-2xl border border-white/10 flex flex-col items-center">
                          <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-500 mb-4">Invite Core Active</span>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-3xl font-black tracking-[0.1em] font-mono",
                              timeLeft === 'EXPIRED' ? "text-red-500/50 line-through" : "gradient-text"
                            )}>
                              {activeTeam.invite?.code}
                            </span>
                            <button 
                              onClick={handleCopyCode}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {copied ? (
                                  <motion.div
                                    key="check"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                  >
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5 text-amber-500/80" />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            timeLeft === 'EXPIRED' ? "text-red-500" : "text-amber-500/80"
                          )}>
                            {timeLeft}
                          </span>
                        </div>
                        <button 
                          onClick={handleRegenerateInvite}
                          disabled={actionLoading}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                        >
                          <RefreshCcw className={cn("w-3 h-3 group-hover:rotate-180 transition-transform", actionLoading && "animate-spin")} />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex-1 glass rounded-[2rem] p-6 border border-[var(--color-border)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wider mb-2">Team Statistics</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-6">Overview of current workforce distribution.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)]">Lead Roles</span>
                        <span className="text-xs font-black text-amber-400">{members.filter(m => m.role === 'leader').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)]">Contributors</span>
                        <span className="text-xs font-black text-blue-500">{members.filter(m => m.role === 'member').length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/5 transition-all">
                    Danger Zone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Simple Info Banner (Contributor) */}
          {activeTeam && !isLeader && (
            <div className="glass rounded-[2rem] p-8 border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {activeTeam.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">{activeTeam.name}</h2>
                    <p className="text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest mt-1">
                      Collaborator View • {members.length} Members
                    </p>
                  </div>
               </div>
               
               <button className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-black transition-all flex items-center gap-2 group">
                 <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 Depart Workspace
               </button>
            </div>
          )}

          {/* Members Title */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-black text-[var(--color-text)] uppercase tracking-wider">Workforce Manifest</h3>
            </div>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--color-surface)] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src={m.profile?.avatar_url} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
              {members.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-tertiary)] flex items-center justify-center text-[10px] font-black">
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl p-6 border border-[var(--color-border)] hover:border-blue-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  {member.role === 'leader' && (
                    <div className="p-1 px-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">LEAD</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[var(--color-border)] group-hover:border-blue-500/30 transition-all p-1">
                      <img 
                        src={member.profile?.avatar_url} 
                        className="w-full h-full object-cover rounded-xl"
                        alt={member.profile?.full_name} 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--surface)]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-[var(--color-text)] truncate text-lg tracking-tight">{member.profile?.full_name}</h4>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase truncate">{member.profile?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest block">DEPLOYED</span>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{formatDate(member.joined_at)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest block">STATUS</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500">Online</span>
                    </div>
                  </div>
                </div>

                {isLeader && member.user_id !== auth.currentUser?.uid && (
                  <button 
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="absolute bottom-6 right-6 p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all border border-red-500/10 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Premium Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!actionLoading) {
                  setShowInviteModal(false);
                  setInviteCode('');
                  setTeamName('');
                  setError('');
                }
              }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-xl glass rounded-[2.5rem] border border-white/10 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />
              
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">Access Portal</h2>
                </div>
                <button 
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteCode('');
                    setTeamName('');
                    setError('');
                  }}
                  disabled={actionLoading}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all active:scale-90"
                >
                  <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                </button>
              </div>

              <div className="flex p-1.5 bg-slate-900 rounded-[1.5rem] mb-10 border border-white/5">
                <button
                  onClick={() => {
                    setInviteMode('join');
                    setError('');
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all",
                    inviteMode === 'join' ? "bg-white text-slate-950 shadow-xl" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Join Force
                </button>
                <button
                  onClick={() => {
                    setInviteMode('create');
                    setError('');
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all",
                    inviteMode === 'create' ? "bg-white text-slate-950 shadow-xl" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Initialize
                </button>
              </div>

              {inviteMode === 'join' ? (
                <div className="space-y-10">
                  <div className="text-center">
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-slate-500 mb-8">Enter Authorization Credential</label>
                    <InviteCodeInput 
                      value={inviteCode}
                      onChange={setInviteCode}
                      onComplete={handleJoinTeam}
                      error={!!error}
                    />
                    <motion.div 
                      key={error}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-8 mt-4"
                    >
                      {error ? (
                        <p className="text-xs font-black text-red-500 flex items-center justify-center gap-2">
                          <Plus className="w-3 h-3 rotate-45" />
                          {error}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-tighter">
                          Case-insensitive 6-character secure hash (12345A)
                        </p>
                      )}
                    </motion.div>
                  </div>
                  
                  <button 
                    onClick={handleJoinTeam}
                    disabled={actionLoading || inviteCode.length < 6}
                    className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <ChevronRight className="w-5 h-5 relative z-10" />}
                    <span className="relative z-10">Authenticate Connection</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-slate-500 pl-2">Workspace Identifier</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="DESIGN HUB XP"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 px-6 pt-7 text-white font-black tracking-wider placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all uppercase"
                      />
                      <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Protocol Initialization</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        Creating this workspace will generate a unique hash valid for 3 hours. Internal membership data will be encrypted and synchronized across the Nexus grid.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleCreateTeam}
                    disabled={actionLoading || !teamName}
                    className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Initialize Core
                  </button>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  E-2-E Encryption Active
                </span>
                <span className="text-[9px] text-slate-800 uppercase font-black tracking-widest">
                  STX-GRID-4.1.2024
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

