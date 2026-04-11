import { useCallback, useEffect, useState } from 'react';
import type { Playlist } from '../types';

const STORAGE_KEY = 'tsbv-playlists';

const COLOR_PALETTE = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#f97316', // orange
  '#ec4899', // pink
];

function randomColor(existingColors: string[]): string {
  // Prefer unused colors before repeating
  const unused = COLOR_PALETTE.filter((c) => !existingColors.includes(c));
  const pool = unused.length > 0 ? unused : COLOR_PALETTE;
  return pool[Math.floor(Math.random() * pool.length)];
}

function load(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Playlist[];
  } catch {
    return [];
  }
}

function save(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(load);

  // Keep localStorage in sync whenever playlists change
  useEffect(() => {
    save(playlists);
  }, [playlists]);

  const createPlaylist = useCallback((name: string) => {
    setPlaylists((prev) => {
      const color = randomColor(prev.map((p) => p.color));
      const next: Playlist = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
        episodeIds: [],
        collapsed: false,
      };
      return [...prev, next];
    });
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addEpisodeToPlaylist = useCallback((playlistId: string, episodeId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.episodeIds.includes(episodeId)
          ? { ...p, episodeIds: [...p.episodeIds, episodeId] }
          : p,
      ),
    );
  }, []);

  const removeEpisodeFromPlaylist = useCallback((playlistId: string, episodeId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, episodeIds: p.episodeIds.filter((id) => id !== episodeId) }
          : p,
      ),
    );
  }, []);

  const toggleEpisodeInPlaylist = useCallback((playlistId: string, episodeId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        const has = p.episodeIds.includes(episodeId);
        return {
          ...p,
          episodeIds: has
            ? p.episodeIds.filter((id) => id !== episodeId)
            : [...p.episodeIds, episodeId],
        };
      }),
    );
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
    );
  }, []);

  const toggleCollapsed = useCallback((id: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, collapsed: !p.collapsed } : p)),
    );
  }, []);

  /** Returns playlist objects that contain the given episodeId */
  const playlistsForEpisode = useCallback(
    (episodeId: string): Playlist[] => playlists.filter((p) => p.episodeIds.includes(episodeId)),
    [playlists],
  );

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addEpisodeToPlaylist,
    removeEpisodeFromPlaylist,
    toggleEpisodeInPlaylist,
    toggleCollapsed,
    playlistsForEpisode,
  };
}
