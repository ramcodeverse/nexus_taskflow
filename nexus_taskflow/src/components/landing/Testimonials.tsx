import React, { useRef } from 'react';
import { motion, useInView, useAnimationFrame } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Clock } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  avatarColor: string;
  stars: number;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Nexus TaskFlow reduced our team fatigue enormously. One platform, everything in one place.",
    name: 'Alex Rivera',
    role: 'Head of Engineering',
    company: 'Vercel',
    initials: 'AR',
    avatarColor: 'from-blue-500 to-cyan-400',
    stars: 5,
    highlight: 'Saved 6 hrs/week',
  },
  {
    quote: "We tried seven project management tools. Nexus TaskFlow is the only one our entire team actually uses.",
    name: 'Maya Patel',
    role: 'Product Manager',
    company: 'Stripe',
    initials: 'MP',
    avatarColor: 'from-cyan-500 to-blue-400',
    stars: 5,
    highlight: '100% adoption rate',
  },
  {
    quote: "The analytics dashboard gives our stakeholders exactly the visibility they need without reports.",
    name: 'Jordan Kim',
    role: 'CTO',
    company: 'Luma AI',
    initials: 'JK',
    avatarColor: 'from-blue-600 to-cyan-500',
    stars: 5,
    highlight: 'Zero custom reports',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial; key?: React.Key }) {
  return (
    <div
      className="relative flex-shrink-0 w-80 lg:w-96 p-6 rounded-2xl border border-white/8 group hover:border-blue-500/30 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 30px rgba(37,99,235,0.1)' }} />

      {/* Quote icon */}
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Quote className="w-10 h-10 text-blue-400" />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.stars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>

      {/* Highlight badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-blue-300 border border-blue-500/20 mb-3" style={{ background: 'rgba(37,99,235,0.08)' }}>
        <TrendingUp className="w-3 h-3" />
        {testimonial.highlight}
      </div>

      {/* Quote */}
      <p className="text-sm text-slate-300 leading-relaxed mb-5">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/8">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-xs text-slate-400">{testimonial.role} · {testimonial.company}</p>
        </div>
      </div>
    </div>
  );
}

function AutoScrollRow({ items, direction = 1, speed = 35 }: { items: Testimonial[]; direction?: number; speed?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useAnimationFrame((_, delta) => {
    if (pausedRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const contentWidth = container.scrollWidth / 2;
    offsetRef.current += (delta / 1000) * speed * direction;
    if (direction > 0 && offsetRef.current >= contentWidth) {
      offsetRef.current -= contentWidth;
    } else if (direction < 0 && offsetRef.current <= -contentWidth) {
      offsetRef.current += contentWidth;
    }
    container.style.transform = `translateX(${-offsetRef.current}px)`;
  });

  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={containerRef} className="flex gap-4 w-max will-change-transform">
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

const stats = [
  { icon: TrendingUp, value: '40%', label: 'avg. productivity increase', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Clock, value: '60%', label: 'fewer project delays', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Users, value: '10,000+', label: 'teams worldwide', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 lg:py-32 bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-16">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 border border-blue-500/30 mb-6" style={{ background: 'rgba(37,99,235,0.08)' }}>
            <Star className="w-3.5 h-3.5 fill-blue-400" />
            Loved by teams everywhere
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Trusted by teams at{' '}
            <span className="gradient-text">world-class companies</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From fast-moving startups to enterprise engineering teams, Nexus TaskFlow has
            become the tool teams rely on to do their best work.
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgb(2 6 23) 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgb(2 6 23) 0%, transparent 100%)' }} />

        <AutoScrollRow items={testimonials} direction={1} speed={25} />
      </div>

      {/* Company logos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <p className="text-center text-sm text-slate-500 mb-8">Trusted at companies including</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 hover:opacity-60 transition-opacity duration-300">
          {['Vercel', 'Stripe', 'Linear', 'Figma', 'Notion', 'Raycast', 'Luma', 'Atlassian'].map((company) => (
            <span key={company} className="text-sm font-semibold text-slate-400 tracking-wide">
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
