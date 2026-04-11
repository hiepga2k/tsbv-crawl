import type { Episode, Playlist } from '../types';

interface RightDockProps {
  episode: Episode | null;
  playlists: Playlist[];
  onScrollTo: (episodeId: string) => void;
  onOpenPlaylistModal: (episodeId: string) => void;
}

function formatDate(pubDate: string): string {
  try {
    return new Date(pubDate).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return pubDate;
  }
}

export function RightDock({ episode, playlists, onScrollTo, onOpenPlaylistModal }: RightDockProps) {
  const memberPlaylists = episode
    ? playlists.filter((pl) => pl.episodeIds.includes(episode.id))
    : [];

  return (
    <aside className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Đang phát
        </h2>
      </div>

      {episode ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Title row: clickable title + add-to-playlist button */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onScrollTo(episode.id)}
                className="text-left text-lg font-bold text-neutral-100 leading-snug hover:text-indigo-300 transition-colors w-full"
                title="Cuộn đến tập này trong danh sách"
              >
                {episode.title}
              </button>
              <p className="text-xs text-neutral-500 mt-1">{formatDate(episode.pubDate)}</p>
            </div>

            {/* Add to playlist button */}
            <button
              onClick={() => onOpenPlaylistModal(episode.id)}
              className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg text-neutral-600 hover:text-indigo-400 hover:bg-neutral-800 transition"
              aria-label="Thêm vào playlist"
              title="Thêm vào playlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>
          </div>

          {/* Playlist membership tags */}
          {memberPlaylists.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {memberPlaylists.map((pl) => (
                <span
                  key={pl.id}
                  className="inline-flex items-center text-[11px] font-medium rounded-full px-2.5 py-0.5 text-white/90"
                  style={{ backgroundColor: pl.color + 'cc' }}
                  title={pl.name}
                >
                  {pl.name}
                </span>
              ))}
            </div>
          )}

          {/* Show notes */}
          <div
            className="prose prose-sm prose-invert max-w-none text-neutral-300 leading-relaxed [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: episode.descriptionHtml }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-neutral-600 text-sm leading-relaxed">
            Chọn một tập để bắt đầu nghe và xem nội dung tại đây.
          </p>
        </div>
      )}
    </aside>
  );
}
