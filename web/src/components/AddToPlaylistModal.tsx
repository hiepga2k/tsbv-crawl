import { useEffect } from 'react';
import type { Episode, Playlist } from '../types';

interface AddToPlaylistModalProps {
  episode: Episode;
  playlists: Playlist[];
  onToggle: (playlistId: string, episodeId: string) => void;
  onClose: () => void;
}

export function AddToPlaylistModal({ episode, playlists, onToggle, onClose }: AddToPlaylistModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-80 max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">Thêm vào playlist</h3>
            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[220px]" title={episode.title}>
              {episode.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-300 transition ml-2 mt-0.5"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 flex flex-col gap-1">
          {playlists.length === 0 ? (
            <p className="text-sm text-neutral-600 italic text-center py-8">
              Chưa có playlist nào. Tạo playlist trước trong dock bên trái.
            </p>
          ) : (
            playlists.map((pl) => {
              const checked = pl.episodeIds.includes(episode.id);
              return (
                <label
                  key={pl.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-neutral-800 transition group"
                >
                  {/* Custom checkbox styled with playlist color */}
                  <span
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                      checked ? 'border-transparent' : 'border-neutral-600 group-hover:border-neutral-400'
                    }`}
                    style={checked ? { backgroundColor: pl.color } : {}}
                  >
                    {checked && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>

                  {/* Colored dot + name */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: pl.color }}
                  />
                  <span className="flex-1 text-sm text-neutral-200 truncate">{pl.name}</span>
                  <span className="text-[10px] text-neutral-600 shrink-0">{pl.episodeIds.length} tập</span>

                  {/* Hidden native input for accessibility */}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(pl.id, episode.id)}
                    className="sr-only"
                  />
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
