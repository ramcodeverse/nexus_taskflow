import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'API Docs', href: '/docs/api' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Partners', href: '/partners' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Community', href: '/community' },
    { label: 'Templates', href: '/templates' },
    { label: 'Webinars', href: '/webinars' },
    { label: 'Status', href: '/status' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'Security', href: '/security' },
    { label: 'SOC 2', href: '/soc2' },
  ],
};

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="relative bg-slate-950 border-t border-white/8 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent blur-sm" />

      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/30 blur-md group-hover:bg-blue-500/50 transition-all duration-300" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                  <Zap className="w-4.5 h-4.5 text-white" fill="white" strokeWidth={0} />
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                Nexus <span className="gradient-text">TaskFlow</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              The AI-powered project management platform that helps ambitious teams ship
              faster, collaborate smarter, and celebrate more wins.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mb-8">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/8 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Stay in the loop</p>
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm text-white outline-none placeholder-slate-500 border border-white/10 bg-white/5 focus:border-blue-500/50 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You're subscribed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                  {section}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('#') || link.href.startsWith('/') ? (
                        <a
                          href={link.href}
                          className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hover:translate-x-0.5 inline-block"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Nexus TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <span className="opacity-30">·</span>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <span className="opacity-30">·</span>
            <a href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</a>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
