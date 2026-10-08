import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import VideoEmbed from '@/components/media/VideoEmbed';
import LeadForm from '@/components/forms/LeadForm';
import Icon from '@/components/Icon';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { formText } from '@/lib/forms';
import { upcomingFairs, fairDate } from '@/lib/site';
import { VIDEOS, videoNode } from '@/lib/videos';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.media.title, description: t.media.lead, path: (l) => href(l, 'media') });
}
export default async function Media({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const vids = VIDEOS.filter((v) => (v.views ?? 0) > 400 || /Automechanika/.test(v.title)).slice(0, 6);
  const fairs = upcomingFairs();
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'media')), name: t.media.title, description: t.media.lead, lang, type: 'CollectionPage' }), ...vids.map(videoNode)])} />
      <PageHero photo="welding" eyebrow={t.nav.company} title={t.media.title} lead={t.media.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.media.title }]} />
      <section className="wrap section-sm">
        <h2 className="h1" style={{ marginBottom: 24 }}>
          {t.media.videos}
        </h2>
        <ul className="grid grid-3" style={{ listStyle: 'none' }}>
          {vids.map((v) => (
            <li key={v.id} className="stack" style={{ gap: 10 }}>
              <VideoEmbed id={v.id} title={v.title} watch={t.common.watch} />
              <strong>{v.title}</strong>
              <span className="small muted mono">{v.date}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="wrap section-sm split">
        <div className="stack">
          <h2 className="h1">{t.media.fairs}</h2>
          {fairs.length ? (
            <ul className="fairs">
              {fairs.map((f) => (
                <li key={f.id} className="card">
                  <span className="mono small muted">{fairDate(f, lang)}</span>
                  <h3 className="h3">{f.name}</h3>
                  <span className="muted">
                    <Icon name="pin" size={14} /> {f.city}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t.home.fairsEmpty}</p>
          )}
          <h2 className="h1" style={{ marginTop: 32 }}>
            {t.media.catalogues}
          </h2>
          <p className="muted">{t.media.catalogueRequest}</p>
          <a className="btn" href={`${href(lang, 'contact')}?topic=catalogue`}>
            <Icon name="download" size={16} /> {t.media.catalogueRequest}
          </a>
        </div>
        <div className="card stack">
          <h2 className="h2">{t.media.subscribe}</h2>
          <p className="muted small">{t.media.subscribeLead}</p>
          <LeadForm
            type="newsletter"
            lang={lang}
            event="newsletter_signup"
            t={{ ...formText(lang, t.media.subscribe), ok: t.media.subscribed }}
            fields={[
              { name: 'email', label: t.forms.email, kind: 'email', required: true, autoComplete: 'email' },
              { name: 'company', label: t.forms.company, kind: 'text', autoComplete: 'organization' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
