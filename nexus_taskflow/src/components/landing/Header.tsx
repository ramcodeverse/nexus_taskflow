import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20 lg:h-24'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/30 blur-md group-hover:bg-blue-500/50 transition-all duration-300" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                  <Zap className="w-4.5 h-4.5 text-white" fill="white" strokeWidth={0} />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Nexus <span className="gradient-text">TaskFlow</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 group rounded-lg hover:bg-white/5"
                >
                  {link.label}
                  <span className="absolute bottom-1.5 left-4 right-4 h-px bg-gradient-to-r from-blue-500 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="relative group px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }} />
                <span className="relative flex items-center gap-1.5">
                  Get Started
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 lg:hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="flex flex-col h-full px-6 pt-20 pb-8">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06 + 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-3 pt-8 border-t border-white/10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full px-4 py-3 text-center text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all duration-200"
                    >
                      Log in
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all duration-200"
                    >
                      Get Started Free
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
