'use client';
import { useRef } from 'react';
import Icon from '@/components/Icon';

/** Sertifika kartı: önizleme, büyütme (lightbox), indirme */
export default function CertCard({ name, desc, src, view, download }: { name: string; desc: string; src: string; view: string; download: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  return (
    <article className="cert">
      <button type="button" style={{ border: 0, padding: 0, background: 'none' }} onClick={() => dlg.current?.showModal()} aria-label={`${view}: ${name}`}>
        <img src={src} alt={name} loading="lazy" width={600} height={846} />
      </button>
      <h3 className="h3">{name}</h3>
      <p className="muted small">{desc}</p>
      <div className="row">
        <button type="button" className="btn btn--sm" onClick={() => dlg.current?.showModal()}>
          {view}
        </button>
        <a className="btn btn--sm btn--ghost" href={src} download>
          <Icon name="download" size={14} /> {download}
        </a>
      </div>
      <dialog ref={dlg} onClick={(e) => e.target === dlg.current && dlg.current?.close()} aria-label={name}>
        <img src={src} alt={name} />
        <form method="dialog" style={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}>
          <button className="icon-btn" style={{ background: '#fff', color: '#000' }} aria-label="Close">
            <Icon name="close" />
          </button>
        </form>
      </dialog>
    </article>
  );
}
