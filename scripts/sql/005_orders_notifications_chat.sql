-- Order statuses, notifications, and chat

-- 1) Order status
alter table if exists orders
  add column if not exists status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','delivered','fulfilled','canceled','refunded'));

create index if not exists idx_orders_status on orders(status);

-- 2) Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_unread on notifications(user_id, read_at);

-- 3) Conversations (buyer-seller) and messages
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id) on delete cascade,
  seller_id uuid not null references users(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_buyer on conversations(buyer_id);
create index if not exists idx_conversations_seller on conversations(seller_id);
create index if not exists idx_conversations_order on conversations(order_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id, created_at);
