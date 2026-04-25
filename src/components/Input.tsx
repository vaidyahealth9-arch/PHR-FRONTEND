import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-3 border rounded-2xl bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-400 focus:outline-none shadow-sm',
          error
            ? 'border-danger-500 focus:ring-danger-200'
            : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
