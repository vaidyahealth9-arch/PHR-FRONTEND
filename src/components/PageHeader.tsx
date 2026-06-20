import { ReactNode } from 'react';

interface StatItem {
  label: string;
  value: string;
}

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  stats?: StatItem[];
  action?: ReactNode;
  /** Optional extra content below stats */
  children?: ReactNode;
}

/**
 * Unified gradient header card used across Dashboard, Records, Billing, SmartTrack.
 * Maintains consistent gradient, icon size, radius, and stats grid styling.
 */
export default function PageHeader({ icon, title, subtitle, stats, action, children }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-success-700 rounded-[1.75rem] shadow-premium p-5 text-white relative overflow-hidden border border-white/10">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -mr-18 -mt-18 pointer-events-none" />

      <div className="relative space-y-4">
        {/* Title row */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-soft flex-shrink-0 text-white">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.35rem] sm:text-[1.6rem] font-black tracking-tight truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-primary-100 text-xs font-medium mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* Stats grid */}
        {stats && stats.length > 0 && (
          <div className={`grid gap-2 sm:gap-3 grid-cols-${Math.min(stats.length, 3)}`}>
            {stats.map((stat, i) => {
              const val = stat.value || '';
              const fontSizeClass = val.length > 10 
                ? 'text-[10px] sm:text-xs' 
                : val.length > 6 
                  ? 'text-xs sm:text-sm' 
                  : 'text-xl sm:text-2xl';

              return (
                <div
                  key={i}
                  className="bg-white/12 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center min-w-0 flex flex-col justify-between"
                >
                  <div className="h-8 flex items-end justify-center min-w-0 pb-0.5">
                    <p className={`${fontSizeClass} font-black tracking-tight leading-none truncate w-full`} title={val}>
                      {val}
                    </p>
                  </div>
                  <p className="text-[11px] font-medium text-primary-100 mt-1 opacity-90 truncate w-full">{stat.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
