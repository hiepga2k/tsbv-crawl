import { forwardRef } from 'react';
import type { Episode, Playlist } from '../types';
import { sortedEpisodes } from '../utils/search';
import { EpisodeCard } from './EpisodeCard';

interface EpisodeListProps {
  episodes: Episode[];
  chips: string[];
  liveQuery: string;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  playlists: Playlist[];
  onPlay: (episode: Episode) => void;
  onOpenPlaylistModal: (episodeId: string) => void;
}

export const EpisodeList = forwardRef<HTMLDivElement, EpisodeListProps>(function EpisodeList(
  { episodes, chips, liveQuery, currentEpisode, isPlaying, playlists, onPlay, onOpenPlaylistModal },
  ref,
) {
  const sorted = sortedEpisodes(episodes, chips, liveQuery);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600 text-sm">
        Không tìm thấy tập phát thanh nào.
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col gap-3 p-4">
      {sorted.map((ep) => {
        const memberPlaylists = playlists.filter((pl) => pl.episodeIds.includes(ep.id));
        return (
          <div key={ep.id} data-episode-id={ep.id}>
            <EpisodeCard
              episode={ep}
              chips={chips}
              liveQuery={liveQuery}
              isCurrent={currentEpisode?.id === ep.id}
              isPlaying={isPlaying && currentEpisode?.id === ep.id}
              memberPlaylists={memberPlaylists}
              onPlay={onPlay}
              onOpenPlaylistModal={onOpenPlaylistModal}
            />
          </div>
        );
      })}
    </div>
  );
});
