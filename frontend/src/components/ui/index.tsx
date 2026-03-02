// ui component library

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// button

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-atlas-500/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-atlas-500 text-white hover:bg-atlas-400 active:bg-atlas-600 shadow-lg shadow-atlas-500/20',
    secondary: 'bg-slate-100 text-text-primary border border-slate-300 hover:bg-slate-200 hover:border-slate-300',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-slate-100/50',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    outline: 'border border-atlas-500/30 text-atlas-400 hover:bg-atlas-500/10 hover:border-atlas-500/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 18} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// card

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover, glow, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover cursor-pointer',
        glow && 'animate-pulse-glow',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// badge

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-text-secondary border-slate-300',
    success: 'bg-atlas-500/10 text-atlas-400 border-atlas-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    premium: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-atlas-500',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'info' && 'bg-blue-400',
          variant === 'default' && 'bg-white/40',
          variant === 'premium' && 'bg-purple-400',
        )} />
      )}
      {children}
    </span>
  );
}

// input

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm',
              'text-text-primary placeholder:text-text-muted/50',
              'focus:border-atlas-500/50 focus:bg-slate-50 transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// select

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm',
            'text-text-primary appearance-none cursor-pointer',
            'focus:border-atlas-500/50 transition-all duration-200',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = 'Select';

// spinner

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// stat card

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  suffix?: string;
  className?: string;
}

export function StatCard({ label, value, trend, icon, suffix, className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-text-primary">
            {value}
            {suffix && <span className="text-sm font-normal text-text-secondary ml-1">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-atlas-500/10 flex items-center justify-center text-atlas-500">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn(
            'text-xs font-medium',
            trend > 0 ? 'text-atlas-500' : trend < 0 ? 'text-red-400' : 'text-text-muted'
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-text-muted">vs last month</span>
        </div>
      )}
      {/* decorative corner gradient */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-atlas-500/5 blur-2xl" />
    </Card>
  );
}

// empty state

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100/50 flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm text-center mb-6">{description}</p>
      {action}
    </div>
  );
}

// skeleton loader

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse bg-slate-100/50 rounded-xl',
      className
    )} />
  );
}

// tooltip

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-slate-100 border border-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-100" />
      </div>
    </div>
  );
}
