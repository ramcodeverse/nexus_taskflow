import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Workflow,
  Bot,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  visual: React.ReactNode;
  reversed?: boolean;
  key?: React.Key;
}

function FeatureSection({
  eyebrow,
  title,
  description,
  bullets,
  icon: Icon,
  accentColor,
  accentBg,
  visual,
  reversed = false,
}: FeatureSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const textVariants = {
    hidden: { x: reversed ? 40 : -40, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  const visualVariants = {
    hidden: { x: reversed ? -40 : 40, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 } },
  };

  const bulletVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  };

  const bulletItem = {
    hidden: { x: -15, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
        reversed ? 'lg:grid-flow-col-dense' : ''
      }`}
    >
      {/* Text side */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className={reversed ? 'lg:col-start-2' : ''}
      >
        {/* Eyebrow */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${accentBg}`} style={{ color: accentColor }}>
          <Icon className="w-3.5 h-3.5" />
          {eyebrow}
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          {title}
        </h3>

        <p className="text-base text-slate-400 leading-relaxed mb-8">
          {description}
        </p>

        <motion.ul
          variants={bulletVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-3 mb-8"
        >
          {bullets.map((bullet) => (
            <motion.li key={bullet} variants={bulletItem} className="flex items-start gap-3">
              <CheckCircle2
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: accentColor }}
              />
              <span className="text-sm text-slate-300">{bullet}</span>
            </motion.li>
          ))}
        </motion.ul>

        <motion.button
          variants={bulletItem}
          className="group inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
          style={{ color: accentColor }}
        >
          Learn more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.button>
      </motion.div>

      {/* Visual side */}
      <motion.div
        variants={visualVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className={reversed ? 'lg:col-start-1' : ''}
      >
        {visual}
      </motion.div>
    </div>
  );
}

/* ── Visual Components ────────────────────────────────────────── */

function WorkflowVisual() {
  const steps = [
    { label: 'New task created', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
    { label: 'Auto-assign to owner', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/20' },
    { label: 'Estimate with AI', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
    { label: 'Notify stakeholders', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
    { label: 'Track & close', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/8 p-6" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Automation Builder</p>
          <h4 className="text-sm font-semibold text-white">Task Creation Workflow</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Active</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${step.border} ${step.bg}`}
          >
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
              <step.icon className={`w-4 h-4 ${step.color}`} />
            </div>
            <div className="flex-1">
              <span className="text-sm text-white">{step.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">~2s</span>
              <Zap className="w-3 h-3 text-slate-500" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
        <Activity className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-blue-300">Processed 4,821 tasks this month · Saved ~38 hours</span>
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/8 p-6 space-y-4" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Nexus AI</p>
          <p className="text-xs text-slate-500">Your project co-pilot</p>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white" style={{ background: 'rgba(37,99,235,0.5)', border: '1px solid rgba(37,99,235,0.3)' }}>
            Break down the "User Auth" epic into sprint tasks
          </div>
        </div>

        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-300 leading-relaxed" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="mb-2">Done! I've broken it into 6 tasks based on your team's velocity:</p>
            <div className="space-y-1.5">
              {['Setup OAuth provider', 'JWT token service', 'Login UI', 'Forgot password flow', 'Session management', 'Security audit'].map((t, i) => (
                <div key={t} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">#{i + 1}</span>
                  <span className="text-white">{t}</span>
                  <span className="ml-auto text-slate-500">~{[2, 3, 1, 2, 1, 1][i]}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <input className="flex-1 bg-transparent text-sm text-slate-400 outline-none placeholder-slate-600" placeholder="Ask AI anything about your project..." readOnly />
        <button className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
        </button>
      </div>
    </div>
  );
}

function CollabVisual() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/8 p-6" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
      {/* Live document */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Sprint 4 Planning Doc</h4>
          <div className="flex -space-x-1.5">
            {['A', 'M', 'S', 'J'].map((l, i) => (
              <div key={l} className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white" style={{ background: `hsl(${i * 60 + 200}, 70%, 45%)`, zIndex: 4 - i }}>
                {l}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-slate-400" style={{ zIndex: 0 }}>+6</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { text: 'Define acceptance criteria for auth module', done: true },
            { text: 'Review API contracts with backend team', done: true },
            { text: 'Estimate effort for each story point...', done: false, typing: true },
          ].map((line) => (
            <div key={line.text} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${line.done ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className={`text-xs leading-relaxed ${line.done ? 'text-slate-400 line-through' : 'text-white'}`}>
                {line.text}
                {line.typing && <span className="ml-1 inline-block w-1.5 h-3.5 bg-blue-400 align-middle animate-pulse" />}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments thread */}
      <div className="border-t border-white/8 pt-4">
        <p className="text-xs text-slate-500 mb-3">Comments · 3</p>
        <div className="space-y-3">
          {[
            { user: 'Maya K.', color: 'bg-cyan-500', text: "Should we add rate limiting to the auth endpoints?" },
            { user: 'Alex L.', color: 'bg-blue-500', text: "Good catch! Adding it to the security checklist." },
          ].map((comment) => (
            <div key={comment.user} className="flex gap-2.5">
              <div className={`w-6 h-6 rounded-full ${comment.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                {comment.user[0]}
              </div>
              <div>
                <span className="text-xs font-semibold text-white">{comment.user}</span>
                <p className="text-xs text-slate-400 mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/8 p-6 space-y-5" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Team Performance</p>
          <h4 className="text-sm font-semibold text-white">Q2 2025 Overview</h4>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">+23% vs Q1</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tasks Shipped', value: '486', delta: '+18%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg. Cycle Time', value: '2.4d', delta: '-0.8d', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Team Velocity', value: '94pts', delta: '+12pts', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Quality Score', value: '97%', delta: '+5%', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className="text-xs text-slate-500">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-white leading-none">{kpi.value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">{kpi.delta}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Daily completions</span>
          <span className="text-xs text-blue-400 font-medium">Last 14 days</span>
        </div>
        <div className="flex items-end gap-1 h-12">
          {[20, 35, 28, 50, 42, 65, 48, 72, 55, 80, 68, 90, 75, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="flex-1 rounded-t-sm"
              style={{ background: `linear-gradient(to top, rgba(37,99,235,0.7), rgba(14,165,233,0.5))` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */

const features: FeatureSectionProps[] = [
  {
    eyebrow: 'Workflow Automation',
    title: 'Automate the work that slows you down',
    description:
      'Build powerful no-code automations in minutes. From task assignment to status updates to Slack notifications—Nexus TaskFlow handles the repetitive so your team focuses on the creative.',
    bullets: [
      'Visual drag-and-drop automation builder',
      '100+ pre-built automation templates',
      'Trigger on any event: status change, due date, mention',
      'Cross-project automation chains',
      'Audit log for every automated action',
    ],
    icon: Workflow,
    accentColor: '#3b82f6',
    accentBg: 'bg-blue-500/10',
    visual: <WorkflowVisual />,
    reversed: false,
  },
  {
    eyebrow: 'AI Productivity',
    title: 'Your AI co-pilot for every project',
    description:
      'Nexus AI understands the full context of your projects. It writes task descriptions, estimates effort, flags blockers before they happen, and summarizes what your team accomplished.',
    bullets: [
      'AI task breakdown from plain-English prompts',
      'Automatic effort estimation based on team history',
      'Daily and weekly AI-written standup summaries',
      'Proactive blocker detection and suggestions',
      'Context-aware search across all your projects',
    ],
    icon: Bot,
    accentColor: '#0ea5e9',
    accentBg: 'bg-cyan-500/10',
    visual: <AIVisual />,
    reversed: true,
  },
  {
    eyebrow: 'Smart Collaboration',
    title: 'Everyone aligned, always in sync',
    description:
      'Real-time multiplayer editing, threaded comments, video clips, and async status updates keep distributed teams as tight as if they were in the same room.',
    bullets: [
      'Real-time cursors and live co-editing',
      'Threaded comments with @mentions',
      'Screen-to-task video clips',
      'Timezone-aware scheduling',
      'Custom notification preferences per project',
    ],
    icon: Users,
    accentColor: '#10b981',
    accentBg: 'bg-emerald-500/10',
    visual: <CollabVisual />,
    reversed: false,
  },
  {
    eyebrow: 'Analytics',
    title: 'Data that drives better decisions',
    description:
      'Beautiful, actionable analytics that help managers spot bottlenecks, celebrate wins, and forecast delivery with confidence. No BI tools required.',
    bullets: [
      'Burndown, velocity, and cycle time charts',
      'Team workload balance heatmaps',
      'Custom KPI dashboards for stakeholders',
      'Exportable PDF/CSV reports',
      'Historical trend analysis',
    ],
    icon: BarChart3,
    accentColor: '#38bdf8',
    accentBg: 'bg-sky-500/10',
    visual: <AnalyticsVisual />,
    reversed: true,
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="solutions" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 border border-blue-500/30 mb-6" style={{ background: 'rgba(37,99,235,0.08)' }}>
            <Shield className="w-3.5 h-3.5" />
            Deep-dive features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Every feature you need,{' '}
            <span className="gradient-text">none you don't</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Nexus TaskFlow was built for real teams facing real complexity. Discover what makes
            it the fastest-growing project management platform.
          </p>
        </motion.div>

        {/* Feature sections */}
        <div className="space-y-32">
          {features.map((feature) => (
            <FeatureSection key={feature.eyebrow} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
