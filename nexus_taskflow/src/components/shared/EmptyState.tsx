import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)]">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-tertiary)] max-w-xs mb-8">{description}</p>
      {action}
    </div>
  );
}
