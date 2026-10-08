import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Photo from '@/components/Photo';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/forms/LeadForm';
import VideoEmbed from '@/components/media/VideoEmbed';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { contactFields, formText } from '@/lib/forms';
import { videoNode, VIDEOS } from '@/lib/videos';
import { getDict, getPages } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.production.title, description: t.production.lead, path: (l) => href(l, 'production') });
}
export default async function Production({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const pg = getPages(lang).production;
  const vids = VIDEOS.filter((v) => ['XJHHMrmgjQo', '4p8SrFRzFDM'].includes(v.id));
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'production')), name: t.production.title, description: t.production.lead, lang }), ...vids.map(videoNode)])} />
      <PageHero photo="production" eyebrow={t.nav.company} title={t.production.title} lead={t.production.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.production.title }]}>
        <div className="row">
          <a className="btn btn--primary btn--lg" href="#project">
            {t.production.projectTitle} →
          </a>
        </div>
      </PageHero>
      <section className="wrap section-sm split split--center">
        <div className="stack" style={{ gap: 18 }}>
          {pg.intro.map((p, i) => (
            <p key={p.slice(0, 20)} className={i === 0 ? 'lead' : 'muted'}>
              {p}
            </p>
          ))}
        </div>
        <div className="media-stack reveal">
          <Photo k="machining" alt={t.photo.machining} sizes="(max-width: 900px) 100vw, 50vw" />
          <Photo k="welding" alt={t.photo.welding} sizes="(max-width: 900px) 48vw, 24vw" />
        </div>
      </section>
      <section className="wrap section-sm">
        <h2 className="h1" style={{ marginBottom: 24 }}>
          {t.production.processTitle}
        </h2>
        <div className="photo-strip reveal">
          <Photo k="hall" alt={t.photo.hall} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="weld" alt={t.photo.weld} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="clutch" alt={t.photo.clutch} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="testbench" alt={t.photo.testbench} sizes="(max-width: 900px) 50vw, 25vw" />
        </div>
        <ol className="h-scroll" tabIndex={0} aria-label={t.production.processTitle}>
          {pg.steps.map((s, i) => (
            <li key={s.t}>
              <div className="process-card">
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h3">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="wrap section-sm split">
        <div className="stack">
          <h2 className="h1">{t.production.machinesTitle}</h2>
          <ul className="machine-list">
            {pg.machines.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div className="stack">
          <h2 className="h1">{t.production.videosTitle}</h2>
          {vids.map((v) => (
            <figure key={v.id} style={{ margin: 0 }} className="stack">
              <VideoEmbed id={v.id} title={v.title} watch={t.common.watch} />
              <figcaption className="small muted">{v.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      {/* 08.10.2026: "video yakında" kutuları yerine gerçek test tezgâhı / ölçüm fotoğrafları, test adları kısa etiket */}
      <section className="wrap section-sm stack" style={{ gap: 24 }}>
        <div className="split split--center">
          <div className="stack" style={{ gap: 18 }}>
            <h2 className="h1">{t.production.testsTitle}</h2>
            <p className="lead">{pg.rnd[0]}</p>
            <p className="muted">{pg.rnd[1]}</p>
            <ul className="row chips" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pg.keyTests.map((k) => (
                <li key={k}>
                  <span className="chip">{k}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="media-stack reveal">
            <Photo k="testbench" alt={t.photo.testbench} sizes="(max-width: 900px) 100vw, 50vw" />
            <Photo k="cmm" alt={t.photo.cmm} sizes="(max-width: 900px) 48vw, 24vw" />
          </div>
        </div>
        <div className="test-groups">
          {pg.testGroups.map((g) => (
            <div key={g.line} className="card stack">
              <h4 className="h3">{g.line}</h4>
              <ul>
                {g.tests.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section id="project" className="wrap-narrow section-sm">
        <div className="card stack">
          <h2 className="h1">{t.production.projectTitle}</h2>
          <p className="muted">{t.production.projectLead}</p>
          <LeadForm
            type="project"
            lang={lang}
            event="project_request"
            t={formText(lang, t.production.projectSubmit)}
            fields={[
              ...contactFields(lang, { message: false }),
              { name: 'projectType', label: t.forms.projectType, kind: 'text', placeholder: 'OEM / private label / …' },
              { name: 'quantity', label: t.forms.quantity, kind: 'text' },
              { name: 'drawing', label: t.forms.drawingFile, kind: 'file', accept: '.pdf,.png,.jpg,.jpeg,.step,.stp,.dwg,.dxf' },
              { name: 'message', label: t.forms.message, kind: 'textarea' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
