import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import type { User } from '@/lib/auth';

const NAV: [string, string, string, string[]?][] = [
  ['/admin/', 'Pano', 'grid'],
  ['/admin/leads/', 'Talepler', 'clipboard'],
  ['/admin/products/', 'Ürünler (PIM)', 'layers', ['admin', 'editor']],
  ['/admin/searches/', 'Bulunamayan aramalar', 'search'],
  ['/admin/offers/', 'Kişiye özel sayfalar', 'user'],
  ['/admin/dealers/', 'Bayiler', 'pin'],
  ['/admin/fairs/', 'Fuarlar', 'globe', ['admin', 'editor']],
  ['/admin/seo/', 'SEO / GEO', 'cert', ['admin', 'editor']],
  ['/admin/settings/', 'Ayarlar', 'factory', ['admin']],
];

/** Panel kabuğu: kenar menü + içerik. Sayfalar requireUser() ile kullanıcıyı alıp buraya verir. */
export default function Shell({ user, active, children }: { user: User; active: string; children: React.ReactNode }) {
  const open = (db().prepare(`select count(*) n from leads where status = 'new'`).get() as { n: number }).n;
  return (
    <div className="adm">
      <aside className="adm-side">
        <a href="/admin/" aria-label="Özteknik Panel">
          <img src="/brand/ozteknik-logo.svg" alt="Özteknik" width={150} height={15} />
        </a>
        <nav aria-label="Panel">
          {NAV.filter(([, , , roles]) => !roles || roles.includes(user.role)).map(([href, label, icon]) => (
            <a key={href} href={href} aria-current={active === href ? 'page' : undefined}>
              <Icon name={icon} size={16} /> {label}
              {href === '/admin/leads/' && open > 0 && <span className="n">{open}</span>}
            </a>
          ))}
        </nav>
        <small>Hesap</small>
        <nav>
          <a href="/admin/account/" aria-current={active === '/admin/account/' ? 'page' : undefined}>
            <Icon name="lock" size={16} /> {user.name || user.email}
          </a>
          <a href="/en/" target="_blank">
            <Icon name="external" size={16} /> Siteyi aç
          </a>
          <form action="/admin/login/logout/" method="post">
            <button className="btn btn--sm btn--ghost btn--block" type="submit">
              Çıkış
            </button>
          </form>
        </nav>
      </aside>
      <main className="adm-main" id="main">
        {children}
      </main>
    </div>
  );
}
