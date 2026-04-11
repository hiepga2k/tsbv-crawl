import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  chips: string[];
  onAddChip: (chip: string) => void;
  onRemoveChip: (chip: string) => void;
  onClearAll: () => void;
  onLiveQuery: (q: string) => void;
  debounceMs?: number;
}

export function SearchBar({
  chips,
  onAddChip,
  onRemoveChip,
  onClearAll,
  onLiveQuery,
  debounceMs = 800,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireDebounce = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onLiveQuery(value), debounceMs);
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    fireDebounce(value);
  };

  const commitChip = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    onLiveQuery('');
    onAddChip(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitChip();
    }
    if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      onRemoveChip(chips[chips.length - 1]);
    }
  };

  const handleClearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputValue('');
    onLiveQuery('');
    onClearAll();
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isPending = inputValue !== '';
  const hasAnything = chips.length > 0 || inputValue !== '';

  return (
    <div className="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-800 px-4 py-3">
      <div className="relative max-w-2xl mx-auto">
        <div
          className={`flex flex-wrap items-center gap-1.5 bg-neutral-800 rounded-lg px-2.5 py-1.5 min-h-[38px] focus-within:ring-2 focus-within:ring-indigo-500 transition ${
            chips.length > 0 ? 'pr-8' : ''
          }`}
        >
          {/* Search icon / spinner */}
          <span className="shrink-0 text-neutral-500 flex items-center">
            {isPending ? (
              <svg className="w-4 h-4 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </span>

          {/* Chips */}
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1 bg-indigo-600 text-indigo-100 text-xs font-medium rounded-md px-2 py-0.5"
            >
              {chip}
              <button
                onClick={() => onRemoveChip(chip)}
                className="ml-0.5 text-indigo-300 hover:text-white transition leading-none"
                aria-label={`Remove "${chip}"`}
              >
                ×
              </button>
            </span>
          ))}

          {/* Text input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chips.length === 0 ? 'Tìm kiếm... (Enter để thêm chip)' : 'Thêm từ khoá...'}
            className="flex-1 min-w-[120px] bg-transparent text-neutral-100 placeholder-neutral-500 text-sm outline-none"
          />
        </div>

        {/* Clear all button */}
        {hasAnything && (
          <button
            onClick={handleClearAll}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition text-lg leading-none"
            aria-label="Clear all"
          >
            ×
          </button>
        )}
      </div>

      {/* Hint */}
      {chips.length > 0 && (
        <p className="text-center text-[11px] text-neutral-600 mt-1.5">
          Kết quả phải khớp tất cả {chips.length} chip · Backspace để xoá chip cuối
        </p>
      )}
    </div>
  );
}
