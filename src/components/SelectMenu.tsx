import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectMenuOption {
  value: string;
  label: string;
  helperText?: string;
}

interface SelectMenuProps {
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function SelectMenu({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const id = useId();
  const listboxId = `select-menu-${id}-listbox`;
  const hintId = `select-menu-${id}-hint`;

  const getOptionId = (index: number) => `select-menu-${id}-option-${index}`;
  const activeDescendantId = open && highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined;

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((option) => {
      return (
        option.label.toLowerCase().includes(q) ||
        option.helperText?.toLowerCase().includes(q)
      );
    });
  }, [options, query, searchable]);

  const closeMenu = () => {
    setOpen(false);
    setHighlightedIndex(-1);
    setQuery('');
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
  };

  const selectOption = (selectedValue: string) => {
    onChange(selectedValue);
    closeMenu();
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (filteredOptions.length === 0) return;
    if (highlightedIndex < 0) {
      setHighlightedIndex(direction === 1 ? 0 : filteredOptions.length - 1);
      return;
    }
    const next = highlightedIndex + direction;
    if (next < 0) {
      setHighlightedIndex(filteredOptions.length - 1);
    } else if (next >= filteredOptions.length) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(next);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        moveHighlight(1);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        moveHighlight(-1);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex].value);
      }
      return;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : filteredOptions.length > 0 ? 0 : -1);
  }, [open, filteredOptions, value]);

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const optionNode = document.getElementById(getOptionId(highlightedIndex));
    optionNode?.scrollIntoView({ block: 'nearest' });
  }, [open, highlightedIndex]);

  return (
    <div ref={rootRef} className="relative w-full">
      <p id={hintId} className="sr-only">
        Use up and down arrow keys to browse options, Enter to select, and Escape to close.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className="select-clinical text-left flex items-center justify-between gap-3 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-describedby={hintId}
        aria-activedescendant={!searchable ? activeDescendantId : undefined}
        aria-expanded={open}
      >
        <span className="truncate text-sm font-semibold">
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-40 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-controls={listboxId}
                aria-describedby={hintId}
                aria-activedescendant={searchable ? activeDescendantId : undefined}
                className="input py-2 text-sm"
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
          <ul id={listboxId} role="listbox" className="py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No options</li>
            ) : (
              filteredOptions.map((option, index) => {
                const isActive = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <li id={getOptionId(index)} key={option.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onClick={() => selectOption(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-2.5 transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-800'
                          : isHighlighted
                            ? 'bg-slate-50 text-slate-800'
                            : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold truncate">{option.label}</span>
                        {option.helperText && (
                          <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{option.helperText}</span>
                        )}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          </div>
        </div>
      )}
    </div>
  );
}
