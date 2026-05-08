import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Workflow,
  Bot,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';

export default function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-32 bg-black relative overflow-hidden border-t border-slate-900">
      {/* Structural Backdrop */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 relative">
        <div className="grid lg:grid-cols-4 gap-[1px] bg-slate-900 border border-slate-900 overflow-hidden">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="lg:col-span-2 bg-black p-12 lg:p-20 flex flex-col justify-end min-h-[400px] relative overflow-hidden"
          >
            {/* Background Graphic */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 to-transparent" />
              <div className="grid grid-cols-8 gap-1 p-8">
                {[...Array(64)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, delay: i * 0.05, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-blue-500"
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-500">Feature Matrix</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
                Engineering <br /> <span className="gradient-text">Efficiency</span>
              </h2>
              <p className="mt-8 text-slate-500 text-lg max-w-sm font-medium tracking-tight">
                Nexus isn't just a tool. It's a high-frequency trading platform for your team's productivity.
              </p>
            </div>
          </motion.div>

          {/* Feature 1 */}
          <div className="bg-black p-12 group hover:bg-slate-950 transition-colors">
            <Bot className="w-8 h-8 text-blue-500 mb-8" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 italic">Neural Core</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Autonomous task synthesis using Gemini 1.5 Pro. Nexus identifies blockers before humans do.
            </p>
            <div className="h-20 bg-slate-900/50 rounded-sm border border-slate-800 p-4 relative overflow-hidden">
              <div className="flex gap-2">
                <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 2, repeat: Infinity }} className="w-1/2 h-full bg-blue-500" />
                </div>
              </div>
              <div className="mt-4 text-[10px] font-mono text-blue-500/50">PROCESSING_NODE_ALPHA</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-black p-12 group hover:bg-slate-950 transition-colors">
            <Workflow className="w-8 h-8 text-cyan-500 mb-8" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 italic">Fluid Logic</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Visual pipeline orchestration with zero latency. Move tasks across nodes with mechanical speed.
            </p>
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 w-[1px] bg-slate-800 group-hover:bg-cyan-500/30 transition-colors" />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="bg-black p-12 group hover:bg-slate-950 transition-colors lg:col-span-2">
            <BarChart3 className="w-8 h-8 text-white mb-8" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 italic">Telemetry</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Deep analytics extracted from every interaction. Real-time velocity benchmarks 
              compared against industry standards.
            </p>
            <div className="mt-12 h-24 flex items-end gap-1">
              {[40, 70, 45, 90, 65, 80, 50, 100, 75, 60, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${h}%` } : {}}
                  transition={{ delay: i * 0.05, duration: 1 }}
                  className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/10 group-hover:from-blue-600/40 transition-all cursor-crosshair"
                />
              ))}
            </div>
          </div>

          <div className="bg-black p-12 group hover:bg-slate-950 transition-colors">
            <Users className="w-8 h-8 text-slate-500 mb-8" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 italic">Swarm</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Massive-scale collaboration. Nexus handles thousands of concurrent contributors without a hitch.
            </p>
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800" />
              ))}
            </div>
          </div>

          <div className="bg-black p-12 group hover:bg-slate-950 transition-colors">
            <Zap className="w-8 h-8 text-amber-500 mb-8" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 italic">Overclock</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Push your team beyond standard limits. AI-driven workload balancing prevents burnout while maximizing throughput.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
