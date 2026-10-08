import videos from '@/content/videos.json';

/** Özteknik YouTube kanalı (RSS'ten; npm run … ile güncellenebilir). VideoObject şeması için. */
export interface Video {
  id: string;
  title: string;
  date: string;
  views: number | null;
}
export const VIDEOS = videos as Video[];
export const videoNode = (v: Video) => ({
  '@type': 'VideoObject',
  name: v.title,
  description: v.title,
  thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
  uploadDate: `${v.date}T00:00:00Z`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
  contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
  publisher: { '@id': 'https://ozteknikoto.com/#organization' },
  ...(v.views ? { interactionStatistic: { '@type': 'InteractionCounter', interactionType: { '@type': 'WatchAction' }, userInteractionCount: v.views } } : {}),
});
