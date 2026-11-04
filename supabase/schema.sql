-- Нийслэл Стор: Supabase (PostgreSQL) схем.
-- Ажиллуулах: Supabase Dashboard > SQL Editor дээр бүхэлд нь буулгаж ажиллуулна, эсвэл `supabase db push`.
-- Бүх хүснэгтэд Row Level Security идэвхтэй. Дүрмүүдийг доороос харна уу.


-- ───────── Төрөл ─────────
create type order_status   as enum ('pending','confirmed','processing','shipped','ready','delivered','cancelled');
create type payment_method as enum ('qpay','socialpay','bank','cod');
create type payment_status as enum ('unpaid','awaiting','paid','failed','refunded');
create type delivery_method as enum ('standard','express','pickup');
create type coupon_type    as enum ('percent','fixed','freeship');
create type staff_role     as enum ('admin','staff');

-- ───────── Ажилтан (админ самбарын эрх) ─────────
create table staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role staff_role not null default 'staff',
  created_at timestamptz not null default now()
);
create or replace function is_staff(min_role staff_role default 'staff') returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from staff_members s
    where s.user_id = auth.uid()
      and (min_role = 'staff' or s.role = 'admin')
  );
$$;

-- ───────── Каталог ─────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  tone text not null default '#E9E1D6',
  art text not null default 'sweater',
  sort int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text not null unique,
  name text not null,
  category_id uuid not null references categories(id) on delete restrict,
  short text not null,
  description text not null,
  highlights text[] not null default '{}',
  specs jsonb not null default '[]',
  price integer not null check (price >= 100),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  colors jsonb not null default '[]',
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  art text not null default 'sweater',
  images jsonb not null default '[]',       -- [{kind:'art',view:0} | {kind:'upload',src:'storage path'}]
  tags text[] not null default '{}',        -- featured, new, bestseller
  visible boolean not null default true,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  sold_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on products(category_id);
create index products_visible_idx on products(visible) where visible;

-- ───────── Нөөцийн хөдөлгөөн ─────────
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  delta integer not null,
  reason text not null check (reason in ('order','cancel','manual','restock','create')),
  reference text,
  stock_after integer not null,
  created_by text,
  created_at timestamptz not null default now()
);
create index inventory_product_idx on inventory_movements(product_id, created_at desc);

-- ───────── Купон, баннер, хүргэлт ─────────
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9]{3,20}$'),
  type coupon_type not null,
  value integer not null default 0 check (value >= 0),
  min_subtotal integer not null default 0,
  max_discount integer not null default 0,
  description text not null default '',
  active boolean not null default true,
  usage_limit integer not null default 0,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null check (placement in ('hero','promo','strip')),
  eyebrow text not null default '', title text not null, subtitle text not null default '',
  cta text not null default '', href text not null check (href like '/%'),
  theme text not null default 'dark', art text not null default 'coat',
  active boolean not null default true, sort int not null default 0
);

create table delivery_districts (
  id text primary key, name text not null unique,
  standard_fee integer not null check (standard_fee >= 0),
  express_fee integer check (express_fee is null or express_fee >= 0),
  standard_days integer not null default 1 check (standard_days >= 1)
);
create table delivery_settings (
  id boolean primary key default true check (id),   -- нэг мөр
  province_fee integer not null default 15000, province_days integer not null default 4,
  free_shipping_threshold integer not null default 200000, express_cutoff_hour integer not null default 15
);
create table pickup_points (id text primary key, name text not null, address text not null, hours text not null);

-- ───────── Харилцагч ─────────
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null, email text not null unique, phone text not null,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null, city text not null, district text not null default '', khoroo text not null default '',
  detail text not null, notes text, is_default boolean not null default false
);
create table wishlist_items (
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (customer_id, product_id)
);
create table newsletter_subscribers (email text primary key, created_at timestamptz not null default now());

-- ───────── Захиалга ─────────
create sequence order_seq;
create table orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,                       -- NS + yymmdd + 4 цифр
  customer_id uuid references customers(id) on delete set null,
  contact_name text not null, contact_phone text not null, contact_email text not null,
  status order_status not null default 'pending',
  coupon_code text,
  subtotal integer not null, item_savings integer not null default 0,
  coupon_discount integer not null default 0, delivery_fee integer not null default 0,
  total integer not null check (total >= 0),
  cancel_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index orders_customer_idx on orders(customer_id, created_at desc);
create index orders_status_idx on orders(status, created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null, sku text not null, art text not null default 'sweater', image jsonb,
  color text, size text,
  unit_price integer not null, compare_at_price integer, quantity integer not null check (quantity > 0)
);

create table order_shipments (
  order_id uuid primary key references orders(id) on delete cascade,
  method delivery_method not null,
  city text not null, district text not null default '', khoroo text not null default '', detail text not null default '',
  notes text not null default '', pickup_point_id text references pickup_points(id),
  estimate text not null default '', fee integer not null default 0
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'unpaid',
  provider text not null,
  reference text not null,
  simulated boolean not null default true,         -- бодит интеграц холбогдсон бол false
  provider_payload jsonb,                          -- QPay invoice_id, SocialPay invoice ...
  paid_at timestamptz
);
create index payments_order_idx on payments(order_id);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null, note text, created_by text,
  created_at timestamptz not null default now()
);

-- ───────── Захиалга үүсгэх: НЭГ транзакц, үнэ сервер талд тооцогдоно ─────────
-- Клиентээс зөвхөн бараа, тоо ширхэг, купон, хүргэлтийн мэдээлэл ирнэ. Үнэ, хөнгөлөлт, нөөцийн хасалт энд хийгдэнэ.
create or replace function place_order(p_contact jsonb, p_shipping jsonb, p_items jsonb, p_coupon text, p_payment_method payment_method)
returns orders language plpgsql security definer set search_path = public as $$
declare
  v_order orders; v_subtotal int := 0; v_discount int := 0; v_fee int := 0; v_item jsonb; v_p products; v_c coupons;
  v_number text; v_free boolean := false; v_ship delivery_districts; v_set delivery_settings;
begin
  select * into v_set from delivery_settings limit 1;
  -- 1) Бараа, нөөц (мөрийг түгжиж давхар захиалгаас сэргийлнэ)
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_p from products where id = (v_item->>'product_id')::uuid and visible for update;
    if not found then raise exception 'Бараа худалдаанд байхгүй' using errcode = 'P0001'; end if;
    if v_p.stock < (v_item->>'quantity')::int then raise exception '% бараа дууссан эсвэл үлдэгдэл хүрэлцэхгүй', v_p.name using errcode = 'P0002'; end if;
    v_subtotal := v_subtotal + v_p.price * (v_item->>'quantity')::int;
  end loop;
  -- 2) Купон
  if p_coupon is not null then
    select * into v_c from coupons where code = upper(p_coupon) and active
      and (expires_at is null or expires_at > now()) and (usage_limit = 0 or used_count < usage_limit) and min_subtotal <= v_subtotal for update;
    if not found then raise exception 'Купон хүчингүй' using errcode = 'P0003'; end if;
    if v_c.type = 'percent' then v_discount := round(v_subtotal * least(v_c.value, 90) / 100.0); if v_c.max_discount > 0 then v_discount := least(v_discount, v_c.max_discount); end if;
    elsif v_c.type = 'fixed' then v_discount := least(v_c.value, v_subtotal);
    else v_free := true; end if;
    update coupons set used_count = used_count + 1 where id = v_c.id;
  end if;
  -- 3) Хүргэлт
  if (p_shipping->>'method') = 'pickup' then v_fee := 0;
  elsif (p_shipping->>'city') <> 'Улаанбаатар' then v_fee := case when v_free then 0 else v_set.province_fee end;
  else
    select * into v_ship from districts_lookup(p_shipping->>'district');
    if v_ship.id is null then raise exception 'Дүүрэг буруу' using errcode = 'P0004'; end if;
    if (p_shipping->>'method') = 'express' then
      if v_ship.express_fee is null then raise exception 'Шуурхай хүргэлт боломжгүй' using errcode = 'P0005'; end if;
      v_fee := case when v_free then 0 else v_ship.express_fee end;
    else
      v_fee := case when v_free or (v_set.free_shipping_threshold > 0 and v_subtotal - v_discount >= v_set.free_shipping_threshold) then 0 else v_ship.standard_fee end;
    end if;
  end if;
  v_number := 'NS' || to_char(now(), 'YYMMDD') || lpad((nextval('order_seq') % 10000)::text, 4, '0');
  insert into orders(number, customer_id, contact_name, contact_phone, contact_email, coupon_code, subtotal, coupon_discount, delivery_fee, total)
  values (v_number, auth.uid(), p_contact->>'name', p_contact->>'phone', p_contact->>'email', upper(p_coupon), v_subtotal, v_discount, v_fee, v_subtotal - v_discount + v_fee)
  returning * into v_order;
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_p from products where id = (v_item->>'product_id')::uuid;
    insert into order_items(order_id, product_id, name, sku, art, color, size, unit_price, compare_at_price, quantity)
    values (v_order.id, v_p.id, v_p.name, v_p.sku, v_p.art, v_item->>'color', v_item->>'size', v_p.price, v_p.compare_at_price, (v_item->>'quantity')::int);
    update products set stock = stock - (v_item->>'quantity')::int, sold_count = sold_count + (v_item->>'quantity')::int, updated_at = now() where id = v_p.id;
    insert into inventory_movements(product_id, delta, reason, reference, stock_after, created_by)
    values (v_p.id, -(v_item->>'quantity')::int, 'order', v_number, v_p.stock - (v_item->>'quantity')::int, 'Захиалга');
  end loop;
  insert into order_shipments(order_id, method, city, district, khoroo, detail, notes, pickup_point_id, fee)
  values (v_order.id, (p_shipping->>'method')::delivery_method, p_shipping->>'city', coalesce(p_shipping->>'district',''), coalesce(p_shipping->>'khoroo',''),
          coalesce(p_shipping->>'detail',''), coalesce(p_shipping->>'notes',''), nullif(p_shipping->>'pickup_point_id',''), v_fee);
  insert into payments(order_id, method, status, provider, reference, simulated)
  values (v_order.id, p_payment_method, case when p_payment_method = 'cod' then 'unpaid'::payment_status else 'awaiting'::payment_status end, 'pending-provider', v_number, true);
  insert into order_events(order_id, status, note, created_by) values (v_order.id, 'pending', 'Захиалга хүлээн авлаа', 'system');
  return v_order;
end $$;

create or replace function districts_lookup(p_name text) returns delivery_districts language sql stable as $$
  select * from delivery_districts where name = p_name limit 1;
$$;

-- ───────── Row Level Security ─────────
alter table categories enable row level security;          alter table products enable row level security;
alter table inventory_movements enable row level security; alter table coupons enable row level security;
alter table banners enable row level security;             alter table delivery_districts enable row level security;
alter table delivery_settings enable row level security;   alter table pickup_points enable row level security;
alter table customers enable row level security;           alter table addresses enable row level security;
alter table wishlist_items enable row level security;      alter table newsletter_subscribers enable row level security;
alter table orders enable row level security;              alter table order_items enable row level security;
alter table order_shipments enable row level security;     alter table payments enable row level security;
alter table order_events enable row level security;        alter table staff_members enable row level security;

-- Нийтэд унших
create policy "public read categories" on categories for select using (true);
create policy "public read visible products" on products for select using (visible or is_staff());
create policy "public read banners" on banners for select using (active or is_staff());
create policy "public read delivery" on delivery_districts for select using (true);
create policy "public read delivery settings" on delivery_settings for select using (true);
create policy "public read pickup" on pickup_points for select using (true);
create policy "public subscribe" on newsletter_subscribers for insert with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
-- Купоныг клиент шууд уншихгүй (код таамаглахаас сэргийлнэ): place_order болон validate_coupon RPC ашиглана.

-- Админ: бүтээгдэхүүн, ангилал, маркетинг, хүргэлт бичих
create policy "admin write products" on products for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write categories" on categories for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write coupons" on coupons for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write banners" on banners for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write districts" on delivery_districts for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write delivery settings" on delivery_settings for all using (is_staff('admin')) with check (is_staff('admin'));
create policy "admin write pickup" on pickup_points for all using (is_staff('admin')) with check (is_staff('admin'));
-- Ажилтан: нөөц, захиалга
create policy "staff read inventory" on inventory_movements for select using (is_staff());
create policy "staff write inventory" on inventory_movements for insert with check (is_staff());
create policy "staff update stock" on products for update using (is_staff()) with check (is_staff());
create policy "staff read subscribers" on newsletter_subscribers for select using (is_staff());

-- Харилцагч өөрийн мэдээллийг л харна
create policy "own customer" on customers for all using (id = auth.uid() or is_staff()) with check (id = auth.uid());
create policy "own addresses" on addresses for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "own wishlist" on wishlist_items for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "own orders" on orders for select using (customer_id = auth.uid() or is_staff());
create policy "staff update orders" on orders for update using (is_staff()) with check (is_staff());
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_staff())));
create policy "own shipments" on order_shipments for select using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_staff())));
create policy "own payments" on payments for select using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_staff())));
create policy "staff update payments" on payments for update using (is_staff()) with check (is_staff());
create policy "own events" on order_events for select using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_staff())));
create policy "staff add events" on order_events for insert with check (is_staff());
create policy "admin manage staff" on staff_members for all using (is_staff('admin')) with check (is_staff('admin'));
-- Зочин (нэвтрээгүй) захиалгыг place_order RPC (security definer) үүсгэнэ. Хянахдаа server route дээр service role ашиглан
-- захиалгын дугаар + утасны дугаар шалгана.

-- Зургийн сан: Storage дээр 'product-images' нийтэд унших bucket үүсгэж, зөвхөн админ бичнэ.
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
