import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuthStore } from '../../store/auth';
import { ArrowRight, Zap, CheckCircle2, Sparkles, Play } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();
  const { signInGuest } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await signInGuest();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-slate-950">
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 mesh-gradient opacity-60" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 border border-blue-500/30 mb-6" style={{ background: 'rgba(37,99,235,0.08)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            14-day free trial · No credit card needed
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Start your free trial{' '}
            <span className="gradient-text">today</span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join 10,000+ teams already using Nexus TaskFlow to ship faster,
            communicate clearer, and celebrate more wins.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/signup"
              className="group relative px-10 py-5 rounded-2xl text-lg font-bold text-white overflow-hidden flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
            >
              <Zap className="relative w-5 h-5 fill-current" />
              <span className="relative">Start Your Free Trial</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="px-10 py-5 rounded-2xl text-lg font-bold text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {demoLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {demoLoading ? 'Connecting...' : 'Explore Demo'}
            </button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          >
            {[
              'No credit card required',
              'Setup in 2 minutes',
              'Cancel anytime',
              'Free forever plan available',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
