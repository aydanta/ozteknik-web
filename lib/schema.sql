pragma journal_mode = wal;
pragma foreign_keys = on;

create table if not exists products (
  slug text primary key,
  code text not null,
  brand text not null,
  category text not null,
  status text not null default 'draft',
  doc text not null,               -- Product JSON
  updated_at text not null
);
create index if not exists products_cat on products(category, status);
create index if not exists products_brand on products(brand, status);

-- OE + çapraz referans + kod araması için düz dizin (normalize anahtar → ürün)
create table if not exists refs (
  norm text not null,
  kind text not null,              -- code | oe | cross
  display text not null,
  make text,                       -- OE için araç üreticisi; cross için rakip marka
  slug text not null references products(slug) on delete cascade
);
create index if not exists refs_norm on refs(norm);
create index if not exists refs_slug on refs(slug);

create table if not exists leads (
  id integer primary key autoincrement,
  type text not null,
  status text not null default 'new',
  created_at text not null,
  first_response_at text,
  lang text not null default 'en',
  country text not null default '',
  company text not null default '',
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  region text not null default '',
  assignee text not null default '',
  payload text not null default '{}',
  notes text not null default '',
  screening text not null default 'pending',
  source text not null default ''
);
create index if not exists leads_type on leads(type, status, created_at);

create table if not exists search_misses (
  norm text primary key,
  query text not null,
  hits integer not null default 1,
  langs text not null default '',
  first_at text not null,
  last_at text not null
);

create table if not exists dealers (
  id integer primary key autoincrement,
  name text not null,
  country text not null,
  city text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  whatsapp text not null default '',
  brands text not null default '',
  consent integer not null default 0,   -- yalnızca izin veren bayi listelenir
  active integer not null default 1,
  updated_at text not null
);

create table if not exists fairs (
  id integer primary key autoincrement,
  name text not null,
  city text not null,
  country text not null default '',
  starts_on text not null,
  ends_on text not null,
  booth text not null default '',
  url text not null default '',
  active integer not null default 1
);

create table if not exists offers (
  token text primary key,
  company text not null,
  country text not null default '',
  lang text not null default 'en',
  contact text not null default '',
  intro text not null default '',
  rows text not null default '[]',     -- [{their:"…", slug:"…"}]
  created_at text not null,
  expires_on text,
  views integer not null default 0,
  last_view_at text,
  active integer not null default 1
);

create table if not exists offer_events (
  id integer primary key autoincrement,
  token text not null references offers(token) on delete cascade,
  at text not null,
  kind text not null,                  -- view | click | sample
  detail text not null default ''
);

create table if not exists users (
  id integer primary key autoincrement,
  email text not null unique,
  name text not null default '',
  role text not null default 'editor',   -- admin | editor | sales
  pass_hash text not null,
  totp_secret text,
  totp_enabled integer not null default 0,
  region text not null default '',
  created_at text not null,
  last_login_at text
);

create table if not exists sessions (
  token text primary key,
  user_id integer not null references users(id) on delete cascade,
  created_at text not null,
  expires_at text not null,
  mfa_ok integer not null default 0
);

create table if not exists settings (
  key text primary key,
  value text not null
);

create table if not exists audit (
  id integer primary key autoincrement,
  at text not null,
  user_email text not null,
  action text not null,
  entity text not null,
  detail text not null default ''
);
