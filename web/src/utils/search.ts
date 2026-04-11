import type { Episode } from '../types';

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Score a single term against one episode. Returns 0 if the term is not found. */
export function scoreEpisode(episode: Episode, query: string): number {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();
  let score = 0;
  if (episode.title.toLowerCase().includes(q)) score += 10;
  const plain = (stripHtml(episode.descriptionHtml) || episode.summary).toLowerCase();
  const occurrences = (plain.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  score += occurrences;
  return score;
}

/**
 * AND logic: all terms must match. Returns 0 if any term has no match.
 * Otherwise returns the sum of individual scores.
 */
export function scoreEpisodeAll(episode: Episode, terms: string[]): number {
  const active = terms.filter((t) => t.trim());
  if (active.length === 0) return 0;
  let total = 0;
  for (const term of active) {
    const s = scoreEpisode(episode, term);
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

/** Sort episodes by multi-term AND score. Episodes with score 0 go to the end. */
export function sortedEpisodes(
  episodes: Episode[],
  chips: string[],
  liveQuery: string,
): Episode[] {
  const terms = [...chips, liveQuery].filter((t) => t.trim());
  if (terms.length === 0) return episodes;
  return [...episodes].sort(
    (a, b) => scoreEpisodeAll(b, terms) - scoreEpisodeAll(a, terms),
  );
}
