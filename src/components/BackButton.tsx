import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  to?: string;
}

/**
 * Standardized back button used across Settings, Notifications, UploadRecord, RecordView.
 */
export default function BackButton({ label, to }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all text-slate-600 hover:text-primary-700"
      aria-label={label || 'Go back'}
      title={label || 'Go back'}
    >
      <ArrowLeft size={18} strokeWidth={2.5} />
    </button>
  );
}
