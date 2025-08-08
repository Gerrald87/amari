-- Seed data for all Amari tables.
-- Prereq: run 001_init.sql and 002_auth.sql.

begin;

-- Ensure demo users exist with deterministic emails.
-- Note: Password hashes are not in pure SQL here; use the Node script to set password_hash.
insert into users (name, email, role, seller_status)
values
  ('Admin',  'admin@amari.com',  'admin',  'none'),
  ('Seller', 'seller@amari.com', 'seller', 'approved'),
  ('Buyer',  'buyer@amari.com',  'buyer',  'none')
on conflict (email) do update
  set name = excluded.name,
      role = excluded.role,
      seller_status = excluded.seller_status;

with
  u_admin  as (select id from users where email = 'admin@amari.com'  limit 1),
  u_seller as (select id from users where email = 'seller@amari.com' limit 1),
  u_buyer  as (select id from users where email = 'buyer@amari.com'  limit 1)

-- Clean previous sample data by name to make the script re-runnable.
-- Only removes the known sample magazines.
, d as (
  delete from magazines
  where name in (
    'Lagos Style — Summer Edition',
    'East Africa Business Review',
    'Pan-African Culture Quarterly',
    'Sahara Arts & Design'
  )
  returning id
)

-- Insert magazines
, m as (
  insert into magazines
    (name, price, language, country, category, format, issue_date, summary, cover_url, rating, reviews_count, seller_id, tags, approved)
  values
    ('Lagos Style — Summer Edition',      6.99, 'English', 'Nigeria',      'Fashion',  'digital', '2025-06-01', 'Contemporary Nigerian fashion, designers, and street style.', '/nigerian-fashion-magazine-cover-vibrant.png', 4.70, 182, (select id from u_seller), array['trending','editors-pick'], true),
    ('East Africa Business Review',       8.50, 'English', 'Kenya',        'Business', 'print',   '2025-05-15', 'Markets, policy, and enterprise across East Africa.',          '/placeholder.svg?height=800&width=600',        4.40,  96, (select id from u_seller), array['business'], true),
    ('Pan-African Culture Quarterly',     5.00, 'English', 'Ghana',        'Culture',  'digital', '2025-04-10', 'Arts, heritage, and contemporary culture narratives.',           '/placeholder.svg?height=800&width=600',        4.80, 210, (select id from u_seller), array['culture','editors-pick'], true),
    ('Sahara Arts & Design',              7.25, 'French',  'Morocco',      'Arts',     'digital', '2025-03-20', 'Visual arts, architecture, and design inspiration.',             '/placeholder.svg?height=800&width=600',        4.30,  54, (select id from u_seller), array['arts'], false) -- pending
  returning id, name
)
select 1;

-- Insert sample pages for a few magazines
with
  s as (select id from users where email = 'seller@amari.com' limit 1),
  ms as (
    select id, name from magazines where seller_id = (select id from s)
      and name in ('Lagos Style — Summer Edition','Pan-African Culture Quarterly','Sahara Arts & Design')
  ),
  del as (
    delete from magazine_pages where magazine_id in (select id from ms)
    returning 1
  )
insert into magazine_pages (magazine_id, idx, url)
select m.id, p.idx, p.url
from ms m
join (
  values
    (1, '/fashion-editorial.png'),
    (2, '/designer-feature-layout.png'),
    (3, '/street-style-collage.png')
) as p(idx, url) on true;

-- Create an order with two items for the buyer
with
  u_buyer  as (select id from users where email = 'buyer@amari.com' limit 1),
  m1 as (select id, price, format from magazines where name = 'Lagos Style — Summer Edition' limit 1),
  m2 as (select id, price, format from magazines where name = 'East Africa Business Review' limit 1),
  existing as (
    select o.id from orders o where o.user_id = (select id from u_buyer) limit 1
  ),
  ins_order as (
    insert into orders (user_id, total)
    select (select id from u_buyer), coalesce((select price from m1),0) * 1 + coalesce((select price from m2),0) * 2
    where not exists (select 1 from existing)
    returning id
  )
insert into order_items (order_id, magazine_id, qty, price, format)
select
  (select id from ins_order),
  x.magazine_id,
  x.qty,
  x.price,
  x.format
from (
  select (select id from m1) as magazine_id, 1 as qty, (select price from m1) as price, (select format from m1) as format
  union all
  select (select id from m2) as magazine_id, 2 as qty, (select price from m2) as price, (select format from m2) as format
) x
where (select id from ins_order) is not null;

commit;

-- Note: To set password hashes for these users, run the Node seeding script (scripts/seed-all.ts).
