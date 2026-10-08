'use client';
import { useState } from 'react';
import Icon from '@/components/Icon';

/** Hafif YouTube gömme: tıklanana kadar yalnız küçük resim (çerez yok, youtube-nocookie) */
export default function VideoEmbed({ id, title, watch }: { id: string; title: string; watch: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="video-card">
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" width={480} height={360} />
          <button type="button" onClick={() => setOn(true)} aria-label={`${watch}: ${title}`}>
            <span className="play">
              <Icon name="play" size={24} />
            </span>
          </button>
        </>
      )}
    </div>
  );
}
