import { useEffect, useRef, useState } from 'react';
import type { Episode } from '../types';

interface AudioPlayerProps {
  episode: Episode | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AudioPlayer({ episode, isPlaying, onPlayPause, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Keep a stable ref to onPlayPause so the keyboard handler doesn't go stale
  const onPlayPauseRef = useRef(onPlayPause);
  useEffect(() => { onPlayPauseRef.current = onPlayPause; }, [onPlayPause]);

  // Sync play / pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // When episode changes, reset and auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode) return;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode?.id]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (audio.buffered.length > 0) {
      setBuffered(audio.buffered.end(audio.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleSkip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(0, Math.min(audio.currentTime + delta, duration));
    audio.currentTime = next;
    setCurrentTime(next);
  };

  // Global keyboard shortcuts: Space = play/pause, ← = -15s, → = +15s
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPauseRef.current();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-15);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(15);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // handleSkip uses audioRef/duration which are refs/state — intentional stable deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 px-4 py-3">
      {episode && (
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onEnded}
          preload="metadata"
        />
      )}

      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Episode title */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate max-w-[60%]">
            {episode ? episode.title : 'Chưa chọn tập nào'}
          </span>
          <span>
            {formatTime(currentTime)} / {formatTime(duration || episode?.durationSeconds || 0)}
          </span>
        </div>

        {/* Seek bar */}
        <div className="relative h-1.5 rounded-full bg-neutral-700 cursor-pointer">
          {/* Buffered indicator */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-neutral-600 pointer-events-none"
            style={{ width: `${bufferedPct}%` }}
          />
          {/* Progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-indigo-500 pointer-events-none"
            style={{ width: `${progress * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || episode?.durationSeconds || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!episode}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Skip back 15s */}
          <button
            onClick={() => handleSkip(-15)}
            disabled={!episode}
            className="text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition text-xs flex flex-col items-center gap-0.5"
            aria-label="Rewind 15 seconds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12.066 11.2a1 1 0 0 0 0 1.6l5.334 4A1 1 0 0 0 19 16V8a1 1 0 0 0-1.6-.8l-5.333 4ZM4.066 11.2a1 1 0 0 0 0 1.6l5.334 4A1 1 0 0 0 11 16V8a1 1 0 0 0-1.6-.8l-5.334 4Z" />
            </svg>
            <span>15s</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            disabled={!episode}
            className="w-11 h-11 rounded-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white flex items-center justify-center transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>

          {/* Skip forward 30s */}
          <button
            onClick={() => handleSkip(30)}
            disabled={!episode}
            className="text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition text-xs flex flex-col items-center gap-0.5"
            aria-label="Forward 30 seconds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M5.268 12.8a1 1 0 0 1 0-1.6l5.333-4A1 1 0 0 1 12.2 8v8a1 1 0 0 1-1.6.8l-5.333-4ZM13.267 12.8a1 1 0 0 1 0-1.6l5.334-4A1 1 0 0 1 20.2 8v8a1 1 0 0 1-1.6.8l-5.334-4Z" />
            </svg>
            <span>30s</span>
          </button>
        </div>
      </div>
    </div>
  );
}
