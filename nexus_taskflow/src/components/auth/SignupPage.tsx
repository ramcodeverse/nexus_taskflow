import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap, Shield, Rocket, Globe, Wand2, Copy, Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { getPasswordStrength } from '../../lib/utils';

const perks = [
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Rocket, text: 'Get started in minutes' },
  { icon: Globe, text: 'Free forever on starter plan' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, signInGuest, loading, user, initialized } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (initialized && user) navigate('/dashboard', { replace: true });
  }, [initialized, user, navigate]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const required = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      '!@#$%^&*',
    ];
    let pw = required.map((set) => set[Math.floor(Math.random() * set.length)]).join('');
    for (let i = pw.length; i < 16; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }
    const arr = pw.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const generated = arr.join('');
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirm(true);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await signInGuest();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Guest access is currently unavailable. Please enable it in the console.');
    } finally {
      setDemoLoading(false);
    }
  };

  const strength = password ? getPasswordStrength(password) : null;

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (strength && strength.label === 'weak') return 'Please choose a stronger password';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    try {
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex dark bg-[var(--color-surface)]">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center glow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Nexus TaskFlow</span>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Start your
              <br />
              <span className="gradient-text">free journey today.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Join thousands of teams who use Nexus TaskFlow to ship faster and collaborate better.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            {perks.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 glass rounded-2xl p-6 border border-white/5"
        >
          <p className="text-slate-300 text-sm italic mb-3 font-medium leading-relaxed">
            "Nexus TaskFlow provides the telemetry and AI-orchestration we needed to scale our engineering throughput by 40%."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-black italic">
              NX
            </div>
            <div>
              <p className="text-white text-sm font-bold tracking-tight">Elena Vance</p>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">VP of Engineering, Lumon.ai</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text)]">Nexus TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Create account</h2>
            <p className="text-[var(--color-text-secondary)]">Free forever, no credit card required</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Auto-generate
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-10 pr-20 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {password && (
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Password strength meter */}
              {password && strength && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            strength.score >= level * 2
                              ? strength.color
                              : 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs font-medium capitalize"
                    style={{ color: strength.color }}
                  >
                    {strength.label} password
                  </p>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-xs text-red-400"
                >
                  Passwords do not match
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors glow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border)]" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-[var(--color-surface)] text-[var(--color-text-tertiary)]">or</span></div>
          </div>

          <motion.button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            whileHover={{ scale: demoLoading ? 1 : 1.02 }}
            whileTap={{ scale: demoLoading ? 1 : 0.98 }}
            className="w-full py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-cyan-400 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {demoLoading ? (
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Try Demo Account
              </>
            )}
          </motion.button>
          <p className="mt-2 text-center text-xs text-[var(--color-text-tertiary)]">
            Pre-loaded with sample projects and tasks
          </p>

          <p className="mt-6 text-center text-[var(--color-text-secondary)] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
