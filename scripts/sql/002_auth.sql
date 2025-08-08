-- Auth + Seller approval migration

-- Add password hash and seller_status to users
alter table if exists users
  add column if not exists password_hash text,
  add column if not exists seller_status text not null default 'none' check (seller_status in ('none','pending','approved','rejected'));

create index if not exists idx_users_email on users (email);

-- Ensure magazines.approved exists (already in 001 but safe)
alter table if exists magazines
  add column if not exists approved boolean not null default false;

-- Helpful view of pending records (optional)
-- select id, name, email, role, seller_status from users where seller_status = 'pending';
-- select id, name, approved from magazines where approved = false;
