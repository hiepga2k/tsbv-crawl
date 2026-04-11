import type { Episode, Playlist } from '../types';
import { scoreEpisodeAll, stripHtml } from '../utils/search';

interface EpisodeCardProps {
  episode: Episode;
  chips: string[];
  liveQuery: string;
  isPlaying: boolean;
  isCurrent: boolean;
  memberPlaylists: Playlist[];
  onPlay: (episode: Episode) => void;
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

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function highlightText(text: string, terms: string[]): React.ReactNode {
  const active = terms.filter((t) => t.trim());
  if (active.length === 0) return text;
  const escaped = active.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-indigo-500/40 text-indigo-100 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function EpisodeCard({
  episode,
  chips,
  liveQuery,
  isPlaying,
  isCurrent,
  memberPlaylists,
  onPlay,
  onOpenPlaylistModal,
}: EpisodeCardProps) {
  const terms = [...chips, liveQuery].filter((t) => t.trim());
  const isSearching = terms.length > 0;
  const hasMatch = isSearching ? scoreEpisodeAll(episode, terms) > 0 : false;
  const plainDescription = stripHtml(episode.descriptionHtml) || episode.summary;
  const preview = plainDescription.slice(0, 160);

  return (
    <article
      className={`rounded-xl border transition-all ${
        isCurrent
          ? 'border-indigo-500 bg-indigo-950/40'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600'
      } p-4 flex gap-3`}
    >
      {/* LEFT — episode info */}
      <div className={`flex flex-col gap-2 ${isSearching && hasMatch ? 'w-48 shrink-0' : 'flex-1'}`}>
        {/* Play button + meta + playlist button */}
        <div className="flex items-start gap-3">
          {/* Play button */}
          <button
            onClick={() => onPlay(episode)}
            aria-label={isPlaying && isCurrent ? 'Pause' : 'Play'}
            className={`shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center transition ${
              isCurrent
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
            }`}
          >
            {isPlaying && isCurrent ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>

          {/* Title + date */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-neutral-100 leading-tight">
              {highlightText(episode.title, terms)}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 flex flex-wrap items-center gap-x-2">
              <span>{formatDate(episode.pubDate)}</span>
              {episode.durationSeconds > 0 && (
                <>
                  <span>·</span>
                  <span>{formatDuration(episode.durationSeconds)}</span>
                </>
              )}
            </p>
          </div>

          {/* Add to playlist button */}
          <button
            onClick={(e) => { e.stopPropagation(); onOpenPlaylistModal(episode.id); }}
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
          <div className="flex flex-wrap gap-1 pl-0">
            {memberPlaylists.map((pl) => (
              <span
                key={pl.id}
                className="inline-flex items-center text-[10px] font-medium rounded-full px-2 py-0.5 text-white/90"
                style={{ backgroundColor: pl.color + 'cc' }}
                title={pl.name}
              >
                {pl.name}
              </span>
            ))}
          </div>
        )}

        {/* Preview (no search) or no-match note */}
        {!isSearching && (
          <p className="text-sm text-neutral-400 line-clamp-3">{preview}</p>
        )}
        {isSearching && !hasMatch && (
          <p className="text-xs text-neutral-600 italic">Không tìm thấy từ khoá.</p>
        )}
        {isSearching && hasMatch && (
          <p className="text-[11px] text-neutral-600 italic leading-tight">
            Cuộn bên phải để đọc nội dung →
          </p>
        )}
      </div>

      {/* RIGHT — scrollable description shown on match */}
      {isSearching && hasMatch && (
        <div className="flex-1 min-w-0 h-[300px] overflow-y-auto overscroll-contain rounded-lg bg-neutral-800/60 border border-neutral-700/50 p-3">
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {highlightText(plainDescription, terms)}
          </p>
        </div>
      )}
    </article>
  );
}
