import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Check,
  Zap,
  Building2,
  Rocket,
  ArrowRight,
  Star,
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small teams and individuals getting started with modern project management.',
    icon: Zap,
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/15',
    features: [
      'Up to 5 team members',
      '3 active projects',
      'Basic Kanban boards',
      'Task comments & mentions',
      '5GB file storage',
      'Mobile apps (iOS & Android)',
      'Email support',
      '7-day activity log',
    ],
    cta: 'Get started free',
    ctaLink: '/signup',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/user/mo',
    description: 'For growing teams that need automation, AI, and advanced analytics to stay ahead.',
    icon: Rocket,
    iconColor: 'text-white',
    iconBg: 'bg-white/20',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'AI Task Assistant',
      'Workflow Automation',
      'Advanced Analytics',
      'Custom Fields & Views',
      '50GB file storage',
      'Priority support + Slack',
      'Custom integrations',
      '90-day activity log',
    ],
    cta: 'Start free trial',
    ctaLink: '/signup?plan=pro',
    popular: true,
    gradientFrom: '#2563eb',
    gradientTo: '#0ea5e9',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations that need security, compliance, and dedicated support.',
    icon: Building2,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    features: [
      'Everything in Pro',
      'SSO / SAML authentication',
      'Advanced security & audit logs',
      'Custom data retention',
      'Dedicated success manager',
      'SLA guarantees',
      'Custom contract & billing',
      'On-premise option',
      'Priority 24/7 support',
      'Unlimited storage',
    ],
    cta: 'Contact sales',
    ctaLink: '/contact',
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 border border-blue-500/30 mb-6" style={{ background: 'rgba(37,99,235,0.08)' }}>
            <Star className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Start free.{' '}
            <span className="gradient-text">Scale as you grow.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Every plan includes a 14-day free trial with full Pro access. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['monthly', 'yearly'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  billing === b ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {billing === b && (
                  <motion.div
                    layoutId="billing-toggle"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative capitalize">{b}</span>
                {b === 'yearly' && (
                  <span className="relative ml-1.5 px-1.5 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/15 rounded-full">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ y: 40, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                tier.popular
                  ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105'
                  : 'border-white/8 hover:border-white/15'
              } border`}
              style={{
                background: tier.popular
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(14,165,233,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
              }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 flex justify-center">
                  <div className="px-4 py-1 rounded-b-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
                    Most Popular
                  </div>
                </div>
              )}

              {/* Glow for popular */}
              {tier.popular && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(37,99,235,0.1)' }} />
              )}

              <div className={`p-6 ${tier.popular ? 'pt-9' : ''}`}>
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${tier.iconBg} flex items-center justify-center ${tier.popular ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : ''}`}>
                    <tier.icon className={`w-5 h-5 ${tier.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white leading-none">
                      {tier.price === 'Custom' ? 'Custom' : billing === 'yearly' && tier.price !== 'Free' ? `$${Math.floor(parseInt(tier.price.replace('$', '')) * 0.8)}` : tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-sm text-slate-400 mb-1">{tier.period}</span>
                    )}
                  </div>
                  {billing === 'yearly' && tier.price !== 'Free' && tier.price !== 'Custom' && (
                    <p className="text-xs text-emerald-400 mt-1">Billed annually · Save 20%</p>
                  )}
                </div>

                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{tier.description}</p>

                {/* CTA */}
                <Link
                  to={tier.ctaLink}
                  className={`group relative w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 mb-6 overflow-hidden ${
                    tier.popular
                      ? 'text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                      : 'text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'
                  }`}
                  style={tier.popular ? { background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' } : {}}
                >
                  {tier.popular && <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />}
                  <span className="relative">{tier.cta}</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

                {/* Features */}
                <ul className="space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.popular ? 'text-cyan-400' : 'text-blue-400'}`} />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
