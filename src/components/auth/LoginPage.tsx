import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, CheckCircle2, BarChart3, Users, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const features = [
  { icon: CheckCircle2, text: 'Intelligent task management' },
  { icon: BarChart3, text: 'Real-time analytics & insights' },
  { icon: Users, text: 'Seamless team collaboration' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInGuest, loading, user, initialized } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (initialized && user) navigate('/dashboard', { replace: true });
  }, [initialized, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await signInGuest();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Guest access is currently unavailable. Please create a free account to explore the dashboard.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark bg-[var(--color-surface)]">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl"
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
              Manage projects
              <br />
              <span className="gradient-text">smarter, faster.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Streamline your workflow with intelligent task management and real-time collaboration.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-400" />
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
          className="relative z-10 glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {['bg-blue-500', 'bg-cyan-500', 'bg-emerald-500'].map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-slate-300 text-sm">Trusted by 10,000+ teams worldwide</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
            <span className="text-slate-400 text-sm ml-1">4.9/5 average rating</span>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text)]">Nexus TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Welcome back</h2>
            <p className="text-[var(--color-text-secondary)]">Sign in to your account to continue</p>
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
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                  Sign in
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
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
