import { useMemo } from 'react';
import type { Episode } from '../types';
import feedData from '../data/feed.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawItem = Record<string, any>;

function normalizeItem(item: RawItem): Episode {
  const id = item['guid']?.['#text'] ?? item['guid'] ?? String(Math.random());
  const title = item['title'] ?? item['itunes:title'] ?? '';
  const pubDate = item['pubDate'] ?? '';
  const summary: string =
    item['itunes:summary']?.['__cdata'] ??
    item['itunes:summary'] ??
    '';
  const descriptionHtml: string =
    item['description']?.['__cdata'] ??
    item['description'] ??
    '';
  const audioUrl: string = item['enclosure']?.['@_url'] ?? '';
  const durationSeconds: number = Number(item['itunes:duration'] ?? 0);

  return { id, title, pubDate, summary, descriptionHtml, audioUrl, durationSeconds };
}

export function usePodcast(): Episode[] {
  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (feedData as any)?.parsed?.rss?.channel;
    if (!channel) return [];
    const rawItems: RawItem[] = Array.isArray(channel.item)
      ? channel.item
      : channel.item
      ? [channel.item]
      : [];
    return rawItems.map(normalizeItem);
  }, []);
}
