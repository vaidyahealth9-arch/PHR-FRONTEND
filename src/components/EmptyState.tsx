import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Standardized empty state card used across all list pages.
 */
export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/40 p-12 text-center space-y-3">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-soft text-slate-300">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
