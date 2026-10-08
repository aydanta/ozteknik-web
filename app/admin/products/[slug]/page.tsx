import { notFound } from 'next/navigation';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { getProduct, BRANDS, BRAND_KEYS, CATEGORIES, FIELDS } from '@/lib/catalog';
import { productCopy } from '@/lib/seo';
import { ISSUE_LABEL } from '@/lib/admin-data';
import { LOCALES, LOCALE_META } from '@/lib/i18n';
import { mediaSrc, productHref } from '@/lib/links';
import { updateProduct } from './actions';

export const metadata = { title: 'Ürün düzenle' };
export default async function EditProduct({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const user = await requireUser(['admin', 'editor']);
  const { slug } = await params;
  const sp = await searchParams;
  const p = getProduct(slug, { includeDraft: true });
  if (!p) notFound();
  const en = productCopy(p, 'en');
  return (
    <Shell user={user} active="/admin/products/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">
            <a href="/admin/products/">Ürünler</a> / {BRANDS[p.brand].name}
          </p>
          <h1 className="mono">{p.code}</h1>
        </div>
        <div className="row">
          <span className={`pill ${p.status === 'active' ? 'pill--ok' : 'pill--warn'}`}>{p.status}</span>
          {p.status === 'active' &&
            (['tr', 'en'] as const).map((l) => (
              <a key={l} className="btn btn--sm" href={productHref(l, p.slug)} target="_blank">
                {l.toUpperCase()} sayfası ↗
              </a>
            ))}
        </div>
      </div>
      {sp.ok && <p className="flash">{sp.ok}</p>}
      {sp.err && <p className="flash flash--err">{sp.err}</p>}
      {p.issues.length > 0 && (
        <p className="row">
          {p.issues.map((i) => (
            <span key={i} className="pill pill--warn">
              {ISSUE_LABEL[i.split(':')[0]] ?? i}
            </span>
          ))}
        </p>
      )}
      <form action={updateProduct} className="adm-grid">
        <input type="hidden" name="slug" value={p.slug} />
        <div className="stack">
          <fieldset>
            <legend>Temel</legend>
            <div className="form-grid">
              <div className="field">
                <label>Marka (kategoriye göre denetlenir)</label>
                <select className="select" name="brand" defaultValue={p.brand}>
                  {BRAND_KEYS.map((b) => (
                    <option key={b} value={b}>
                      {BRANDS[b].name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Kategori</label>
                <select className="select" name="category" defaultValue={p.category}>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.one.tr} ({BRANDS[c.brand].name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Durum</label>
                <select className="select" name="status" defaultValue={p.status}>
                  <option value="active">Yayında</option>
                  <option value="draft">Taslak</option>
                  <option value="archive">Arşiv (muadile 301)</option>
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>OE numaraları — her satır: Araç üreticisi; numara</legend>
            <textarea className="textarea mono-area" name="oe" rows={10} defaultValue={p.oe.map((o) => `${o.make ?? ''}; ${o.value}`).join('\n')} />
            <p className="small muted">Boşluklu/boşluksuz yazım otomatik eşleşir. Üretici boş bırakılırsa "belirsiz" olarak işaretlenir.</p>
          </fieldset>
          <fieldset>
            <legend>Çapraz referanslar — her satır: Marka; numara</legend>
            <textarea className="textarea mono-area" name="cross" rows={4} defaultValue={p.cross.map((x) => `${x.brand}; ${x.value}`).join('\n')} />
          </fieldset>
          <fieldset>
            <legend>Teknik özellikler — her satır: alan=değer</legend>
            <textarea className="textarea mono-area" name="specs" rows={6} defaultValue={p.specs.map((s) => `${s.key}=${s.value}`).join('\n')} />
            <p className="small muted">Alanlar: {Object.keys(FIELDS).join(', ')}</p>
          </fieldset>
          <div className="form-grid">
            <fieldset>
              <legend>Araç markaları (satır başına)</legend>
              <textarea className="textarea" name="makes" rows={5} defaultValue={p.makes.join('\n')} />
            </fieldset>
            <fieldset>
              <legend>Modeller (satır başına)</legend>
              <textarea className="textarea" name="models" rows={5} defaultValue={p.models.join('\n')} />
            </fieldset>
          </div>
          <fieldset>
            <legend>Set içeriği / ilgili parçalar (kod, satır başına)</legend>
            <textarea className="textarea mono-area" name="kit" rows={3} defaultValue={p.kit.join('\n')} />
          </fieldset>
          <fieldset>
            <legend>Özet cümlesi — editör onaylı (boşsa şablondan üretilir)</legend>
            {LOCALES.map((l) => (
              <div key={l} className="field">
                <label>{LOCALE_META[l].native}</label>
                <textarea className="textarea" name={`summary_${l}`} rows={2} dir={LOCALE_META[l].dir} defaultValue={p.overrides.summary?.[l] ?? ''} placeholder={productCopy(p, l).summary} />
              </div>
            ))}
          </fieldset>
          <button className="btn btn--primary btn--lg">Kaydet ve yayınla</button>
        </div>
        <aside className="stack">
          <fieldset>
            <legend>Görseller</legend>
            {p.images.map((img, i) => (
              <div key={img.file} className="stack" style={{ gap: 6 }}>
                <img src={mediaSrc(img.file, 400)} alt="" style={{ background: '#fff', borderRadius: 8, width: '100%', maxHeight: 180, objectFit: 'contain' }} />
                <code className="small">{img.file}</code>
                <span className={`pill ${img.width >= 1600 ? 'pill--ok' : 'pill--warn'}`}>
                  {img.width}×{img.height} px {img.width < 1600 ? '· yeniden çekim listesinde' : ''}
                </span>
                <label className="check">
                  <input type="checkbox" name={`wm_${i}`} defaultChecked={!!img.watermark} /> Filigranlı
                </label>
                <span className="small muted">Alt (EN): {en.alt(i)}</span>
              </div>
            ))}
            {!p.images.length && <p className="muted small">Görsel yok — ürün yayına alınamaz.</p>}
          </fieldset>
          <fieldset>
            <legend>Önizleme (EN)</legend>
            <p className="small">
              <b>Başlık:</b> {en.title} <span className="muted">({en.title.length})</span>
            </p>
            <p className="small">
              <b>Açıklama:</b> {en.description} <span className="muted">({en.description.length})</span>
            </p>
            <p className="small">
              <b>Özet:</b> {en.summary}
            </p>
          </fieldset>
          <fieldset>
            <legend>Taşıma</legend>
            <p className="small muted">
              WP ID {p.legacy.wpId} · eski adres <code>{p.legacy.url}</code> · diller: {p.legacy.langs.join(', ')}
            </p>
            <p className="small muted">Son güncelleme: {p.updatedAt}</p>
          </fieldset>
        </aside>
      </form>
    </Shell>
  );
}
