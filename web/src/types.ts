export interface Episode {
  id: string;
  title: string;
  pubDate: string;
  /** Plain-text summary for search matching */
  summary: string;
  /** Raw HTML for the right dock */
  descriptionHtml: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface Playlist {
  id: string;
  name: string;
  /** Hex color string picked from the palette on creation */
  color: string;
  episodeIds: string[];
  collapsed: boolean;
}
