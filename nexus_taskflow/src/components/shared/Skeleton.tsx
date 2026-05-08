import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'chart' | 'avatar';
  lines?: number;
  className?: string; // Explicitly add it just in case
  key?: React.Key;
}

export default function Skeleton({ variant = 'text', lines = 1, className, ...props }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-[var(--color-border)] opacity-50 h-4 rounded',
              i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--color-border)] opacity-50',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'rect' && 'h-32 w-full rounded-xl',
        variant === 'circle' && 'h-12 w-12 rounded-full',
        variant === 'card' && 'h-48 w-full rounded-2xl',
        variant === 'chart' && 'h-64 w-full rounded-2xl',
        variant === 'avatar' && 'h-10 w-10 rounded-xl',
        className
      )}
    />
  );
}
