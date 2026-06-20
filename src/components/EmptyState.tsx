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
    <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/40 p-8 text-center space-y-2">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-soft text-slate-300">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 leading-relaxed">{subtitle}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
