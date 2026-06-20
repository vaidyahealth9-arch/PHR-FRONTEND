import { ChevronDown } from 'lucide-react';
import { useActiveProfile } from '../context/ProfileContext';
import { useProfiles } from '../hooks/useApi';

interface ProfileSwitcherProps {
  label?: string;
  className?: string;
}

/**
 * Standardized profile dropdown used on Records, Billing, and Profile pages.
 * Pulls from shared ProfileContext — changes reflect globally.
 */
export default function ProfileSwitcher({ label = 'Viewing Records For', className = '' }: ProfileSwitcherProps) {
  const { profiles, activeProfileId, setActiveProfileId } = useActiveProfile();
  const { isLoading } = useProfiles();

  if (isLoading || profiles.length === 0) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">{label}</label>
      <div className="relative">
        <select
          value={activeProfileId || ''}
          onChange={(e) => setActiveProfileId(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none transition-all hover:border-primary-200"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}{p.is_primary ? ' (Primary)' : ` (${p.relationship})`}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
