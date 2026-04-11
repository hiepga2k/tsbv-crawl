import { useCallback, useEffect, useRef, useState } from 'react';
import type { Episode } from './types';
import { usePodcast } from './hooks/usePodcast';
import { usePlaylists } from './hooks/usePlaylists';
import { SearchBar } from './components/SearchBar';
import { EpisodeList } from './components/EpisodeList';
import { AudioPlayer } from './components/AudioPlayer';
import { RightDock } from './components/RightDock';
import { LeftDock } from './components/LeftDock';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';

const DOCK_MIN_WIDTH = 320;

export default function App() {
  const episodes = usePodcast();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    toggleEpisodeInPlaylist,
    toggleCollapsed,
  } = usePlaylists();

  const [chips, setChips] = useState<string[]>([]);
  const [liveQuery, setLiveQuery] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal state: episodeId being managed, or null
  const [modalEpisodeId, setModalEpisodeId] = useState<string | null>(null);
  const modalEpisode = modalEpisodeId
    ? (episodes.find((ep) => ep.id === modalEpisodeId) ?? null)
    : null;

  // Ref for the episode list scroll container
  const listRef = useRef<HTMLDivElement>(null);

  // Right dock resize state
  const [dockWidth, setDockWidth] = useState(DOCK_MIN_WIDTH);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handlePlay = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (!currentEpisode) return;
    setIsPlaying((prev) => !prev);
  };

  const handleEnded = () => setIsPlaying(false);

  // Chip management
  const handleAddChip = (chip: string) =>
    setChips((prev) => (prev.includes(chip) ? prev : [...prev, chip]));
  const handleRemoveChip = (chip: string) =>
    setChips((prev) => prev.filter((c) => c !== chip));
  const handleClearAll = () => { setChips([]); setLiveQuery(''); };

  // Scroll to episode in the list
  const scrollToEpisode = useCallback((episodeId: string) => {
    const card = listRef.current?.querySelector(`[data-episode-id="${episodeId}"]`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Right dock drag-to-resize
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = dockWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [dockWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      const next = Math.min(
        window.innerWidth,
        Math.max(DOCK_MIN_WIDTH, dragStartWidth.current + delta),
      );
      setDockWidth(next);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291A6.751 6.751 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100 leading-tight">Tâm Sự Buồn Vui</h1>
          <p className="text-xs text-neutral-500">#tsbv · {episodes.length} tập</p>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: playlist dock (hidden on small screens) */}
        <div className="hidden lg:block shrink-0 pb-28 overflow-hidden">
          <LeftDock
            playlists={playlists}
            episodes={episodes}
            onCreatePlaylist={createPlaylist}
            onDeletePlaylist={deletePlaylist}
            onRenamePlaylist={renamePlaylist}
            onToggleCollapsed={toggleCollapsed}
            onScrollTo={scrollToEpisode}
          />
        </div>

        {/* Center: episode list */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <SearchBar
            chips={chips}
            onAddChip={handleAddChip}
            onRemoveChip={handleRemoveChip}
            onClearAll={handleClearAll}
            onLiveQuery={setLiveQuery}
          />
          <div className="flex-1 overflow-y-auto pb-28">
            <EpisodeList
              ref={listRef}
              episodes={episodes}
              chips={chips}
              liveQuery={liveQuery}
              currentEpisode={currentEpisode}
              isPlaying={isPlaying}
              playlists={playlists}
              onPlay={handlePlay}
              onOpenPlaylistModal={setModalEpisodeId}
            />
          </div>
        </div>

        {/* Right: resizable now-playing dock */}
        <div
          className="hidden lg:flex flex-col shrink-0 overflow-hidden pb-28 relative"
          style={{ width: dockWidth }}
        >
          <div
            onMouseDown={onDragStart}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group"
            title="Kéo để thay đổi kích thước"
          >
            <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-800 group-hover:bg-indigo-500 group-active:bg-indigo-400 transition-colors" />
            <div className="absolute -left-1.5 top-0 bottom-0 w-4" />
          </div>
          <RightDock
            episode={currentEpisode}
            playlists={playlists}
            onScrollTo={scrollToEpisode}
            onOpenPlaylistModal={setModalEpisodeId}
          />
        </div>
      </div>

      {/* Bottom: audio player */}
      <AudioPlayer
        episode={currentEpisode}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onEnded={handleEnded}
      />

      {/* Add-to-playlist modal */}
      {modalEpisode && (
        <AddToPlaylistModal
          episode={modalEpisode}
          playlists={playlists}
          onToggle={toggleEpisodeInPlaylist}
          onClose={() => setModalEpisodeId(null)}
        />
      )}
    </div>
  );
}
