import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Get in touch</h2>
            <p className="text-lg text-[var(--color-text-tertiary)] max-w-2xl mx-auto">
              Have questions about Nexus? Our team is here to help you orchestrate your future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email us</h3>
                  <p className="text-[var(--color-text-tertiary)]">hello@nexus-taskflow.ai</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Live Chat</h3>
                  <p className="text-[var(--color-text-tertiary)]">Available 24/7 for Enterprise customers</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Office</h3>
                  <p className="text-[var(--color-text-tertiary)]">123 Nexus Blvd, Silicon Valley, CA</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 border border-[var(--color-border)]">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/50 border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-950/50 border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-slate-950/50 border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 group">
                  Send Message
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
