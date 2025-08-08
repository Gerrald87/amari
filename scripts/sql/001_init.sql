-- Amari baseline schema (Neon/Postgres)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('buyer','seller','admin')),
  created_at timestamptz not null default now()
);

create table if not exists magazines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  language text not null,
  country text not null,
  category text not null,
  format text not null check (format in ('print','digital')),
  issue_date date not null,
  summary text not null,
  cover_url text not null,
  rating numeric(3,2) default 4.50,
  reviews_count int default 0,
  seller_id uuid not null references users(id) on delete cascade,
  tags text[] default '{}',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists magazine_pages (
  id uuid primary key default gen_random_uuid(),
  magazine_id uuid not null references magazines(id) on delete cascade,
  idx int not null,
  url text not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  magazine_id uuid not null references magazines(id) on delete cascade,
  qty int not null default 1,
  price numeric(10,2) not null,
  format text not null check (format in ('print','digital'))
);

-- Helpful indexes
create index if not exists idx_magazines_category on magazines(category);
create index if not exists idx_magazines_country on magazines(country);
create index if not exists idx_magazines_language on magazines(language);
create index if not exists idx_magazines_tags on magazines using gin(tags);
create index if not exists idx_orders_user on orders(user_id);
