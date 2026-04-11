import { useRef, useState } from 'react';
import type { Episode, Playlist } from '../types';

interface LeftDockProps {
  playlists: Playlist[];
  episodes: Episode[];
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRenamePlaylist: (id: string, name: string) => void;
  onToggleCollapsed: (id: string) => void;
  onScrollTo: (episodeId: string) => void;
}

interface PlaylistRowProps {
  playlist: Playlist;
  episodes: Episode[];
  onToggleCollapsed: (id: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRenamePlaylist: (id: string, name: string) => void;
  onScrollTo: (episodeId: string) => void;
}

function PlaylistRow({ playlist, episodes, onToggleCollapsed, onDeletePlaylist, onRenamePlaylist, onScrollTo }: PlaylistRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  const items = playlist.episodeIds
    .map((id) => episodes.find((ep) => ep.id === id))
    .filter((ep): ep is Episode => ep !== undefined);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(playlist.name);
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== playlist.name) {
      onRenamePlaylist(playlist.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setIsEditing(false); setEditName(playlist.name); }
  };

  return (
    <div className="flex flex-col">
      {/* Playlist header — click anywhere to toggle collapse */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isEditing && onToggleCollapsed(playlist.id)}
        onKeyDown={(e) => { if (!isEditing && (e.key === 'Enter' || e.key === ' ')) onToggleCollapsed(playlist.id); }}
        className="flex items-start gap-2 px-3 py-2 group hover:bg-neutral-800/50 rounded-lg transition cursor-pointer select-none"
      >
        {/* Colored dot + chevron stacked */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: playlist.color }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`w-3 h-3 text-neutral-700 transition-transform ${playlist.collapsed ? '' : 'rotate-180'}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Name or inline edit input */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={commitRename}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-neutral-800 text-neutral-100 text-sm rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          ) : (
            <span className="text-sm font-medium text-neutral-200 whitespace-normal break-words leading-snug">
              {playlist.name}
            </span>
          )}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {/* Episode count */}
          <span className="text-[10px] text-neutral-600">{items.length}</span>

          {/* Edit button — visible on hover */}
          <button
            onClick={startEditing}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-neutral-600 hover:text-indigo-400 hover:bg-neutral-700 transition"
            aria-label={`Đổi tên playlist "${playlist.name}"`}
            title="Đổi tên"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
            </svg>
          </button>

          {/* Delete button — visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); onDeletePlaylist(playlist.id); }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-neutral-600 hover:text-rose-400 hover:bg-neutral-700 transition"
            aria-label={`Xoá playlist "${playlist.name}"`}
            title="Xoá playlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible episode list */}
      {!playlist.collapsed && (
        <div className="overflow-y-auto overscroll-contain ml-5 mr-2 mb-1 flex flex-col gap-0.5">
          {items.length === 0 ? (
            <p className="text-[11px] text-neutral-700 italic px-2 py-1">Chưa có tập nào</p>
          ) : (
            items.map((ep) => (
              <button
                key={ep.id}
                onClick={() => onScrollTo(ep.id)}
                className="text-left text-xs text-neutral-400 hover:text-neutral-100 whitespace-normal break-words px-2 py-1 rounded hover:bg-neutral-800 transition leading-snug"
              >
                {ep.title}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function LeftDock({ playlists, episodes, onCreatePlaylist, onDeletePlaylist, onRenamePlaylist, onToggleCollapsed, onScrollTo }: LeftDockProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startAdding = () => {
    setIsAdding(true);
    setNewName('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitCreate = () => {
    const trimmed = newName.trim();
    if (trimmed) onCreatePlaylist(trimmed);
    setIsAdding(false);
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitCreate();
    if (e.key === 'Escape') { setIsAdding(false); setNewName(''); }
  };

  return (
    <aside className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 w-60 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Playlists
        </h2>
        <button
          onClick={startAdding}
          className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700 transition"
          aria-label="Tạo playlist mới"
          title="Tạo playlist mới"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Inline create input */}
      {isAdding && (
        <div className="px-3 py-2 border-b border-neutral-800">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitCreate}
            placeholder="Tên playlist..."
            className="w-full bg-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p className="text-[10px] text-neutral-700 mt-1">Enter để lưu · Esc để huỷ</p>
        </div>
      )}

      {/* Playlist list */}
      <div className="flex-1 overflow-y-auto py-2 px-1 flex flex-col gap-0.5">
        {playlists.length === 0 && !isAdding && (
          <p className="text-xs text-neutral-700 italic text-center mt-6 px-4">
            Chưa có playlist nào. Nhấn + để tạo mới.
          </p>
        )}
        {playlists.map((pl) => (
          <PlaylistRow
            key={pl.id}
            playlist={pl}
            episodes={episodes}
            onToggleCollapsed={onToggleCollapsed}
            onDeletePlaylist={onDeletePlaylist}
            onRenamePlaylist={onRenamePlaylist}
            onScrollTo={onScrollTo}
          />
        ))}
      </div>
    </aside>
  );
}
