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
    <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-success-700 rounded-2xl sm:rounded-[1.75rem] shadow-premium p-4 sm:p-5 text-white relative overflow-hidden border border-white/10">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -mr-14 -mt-14 pointer-events-none" />

      <div className="relative space-y-3">
        {/* Title row */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-soft flex-shrink-0 text-white">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-[1.4rem] font-black tracking-tight truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-primary-100 text-[10px] sm:text-xs font-medium mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* Stats grid */}
        {stats && stats.length > 0 && (
          <div className={`grid gap-1.5 sm:gap-2.5 grid-cols-${Math.min(stats.length, 3)}`}>
            {stats.map((stat, i) => {
              const val = stat.value || '';
              const fontSizeClass = val.length > 10 
                ? 'text-[9px] sm:text-[10px]' 
                : val.length > 6 
                  ? 'text-[10px] sm:text-xs' 
                  : 'text-lg sm:text-xl';

              return (
                <div
                  key={i}
                  className="bg-white/12 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 text-center min-w-0 flex flex-col justify-between"
                >
                  <div className="h-6 sm:h-8 flex items-end justify-center min-w-0 pb-0.5">
                    <p className={`${fontSizeClass} font-black tracking-tight leading-none truncate w-full`} title={val}>
                      {val}
                    </p>
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-medium text-primary-100 mt-0.5 opacity-90 truncate w-full">{stat.label}</p>
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
