import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Heart,
  Rocket,
  Users,
  Zap,
  Target,
  Globe,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const values = [
  {
    icon: Rocket,
    title: 'Velocity without chaos',
    description: 'We believe the fastest teams aren\'t the ones working harder—they\'re the ones working with clarity.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Heart,
    title: 'People first, always',
    description: 'Tooling should serve people, not the other way around. We design every feature to reduce friction and increase joy.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Target,
    title: 'Radical focus',
    description: 'We\'d rather do a handful of things exceptionally well than a hundred things mediocrely. Opinionated by design.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Globe,
    title: 'Built for the world',
    description: 'Teams everywhere deserve world-class tooling, regardless of timezone, language, or company size.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
];
export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const valuesRef = useRef<HTMLDivElement>(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: '-80px' });

  return (
    <section id="about" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Mission split layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-28">
          {/* Left: mission text */}
          <motion.div
            ref={ref}
            initial={{ x: -40, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 border border-blue-500/30 mb-6" style={{ background: 'rgba(37,99,235,0.08)' }}>
              <Users className="w-3.5 h-3.5" />
              Our story
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              We built the tool{' '}
              <span className="gradient-text">we wished existed</span>
            </h2>

            <div className="space-y-4 text-base text-slate-400 leading-relaxed">
              <p>
                In 2021, our founding team was running a 30-person engineering organization
                juggling Jira, Slack, Notion, and five other tools simultaneously. Every standup
                started with "wait, where did that ticket go?" Every sprint ended with a
                post-mortem about miscommunication.
              </p>
              <p>
                We tried everything on the market. Every tool was either too simple for real
                complexity or so bloated it created new problems. None of them thought deeply
                about how modern, distributed teams actually work.
              </p>
              <p>
                So we quit our jobs and built Nexus TaskFlow. Not as another project management
                tool—as the operating system for how teams think, communicate, and execute.
              </p>
            </div>

            <motion.button
              whileHover={{ x: 4 }}
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Meet the team
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </motion.div>

          {/* Right: stats + gradient visual */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/10 rounded-3xl blur-2xl scale-110" />

            <div
              className="relative rounded-2xl p-8 border border-white/8"
              style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}
            >
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-5 mb-8">
                {[
                  { icon: Users, label: 'Teams', value: '10,000+', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: Globe, label: 'Countries', value: '80+', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { icon: TrendingUp, label: 'Tasks shipped', value: '100M+', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: Zap, label: 'Automations run', value: '1B+', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Journey description */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Our focus</p>
                <p className="text-sm text-slate-400 italic">
                  Built by engineers, for engineers. We focus on the details so you can focus on the big picture.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values section */}
        <div ref={valuesRef}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={valuesInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              What we believe
            </h3>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Our values aren't corporate talking points. They're the actual principles we
              use to make product decisions every day.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ y: 30, opacity: 0 }}
                animate={valuesInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className={`p-5 rounded-2xl border ${value.border} transition-all duration-300`}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className={`w-10 h-10 rounded-xl ${value.bg} flex items-center justify-center mb-4`}>
                  <value.icon className={`w-5 h-5 ${value.color}`} />
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">{value.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team philosophy banner */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={valuesInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 p-8 md:p-12 rounded-2xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(14,165,233,0.08) 100%)',
            border: '1px solid rgba(37,99,235,0.25)',
          }}
        >
          {/* Decorative blur */}
          <div className="absolute top-0 left-1/4 w-64 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <blockquote className="relative text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-3xl mx-auto mb-4">
            "The best project management tool is the one your{' '}
            <span className="gradient-text">entire team actually uses</span>."
          </blockquote>
          <p className="text-sm text-slate-400">
            — Alex Rivera, Co-founder & CEO
          </p>
        </motion.div>
      </div>
    </section>
  );
}
