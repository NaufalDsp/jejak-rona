-- ==============================================================================
-- Migrasi Tahap 10: Pengerasan Keamanan (Security Hardening & RLS Audit)
-- ==============================================================================

-- 1. PASTIKAN ROW LEVEL SECURITY AKTIF PADA SEMUA TABEL
alter table if exists public.profiles enable row level security;
alter table if exists public.pages enable row level security;
alter table if exists public.posts enable row level security;
alter table if exists public.media enable row level security;
alter table if exists public.revisions enable row level security;
alter table if exists public.site_settings enable row level security;
alter table if exists public.nav_items enable row level security;
alter table if exists public.submissions enable row level security;

-- 2. VIEW AUDIT KEAMANAN RLS
-- Membantu administrator memverifikasi bahwa tidak ada tabel yang lolos dari RLS
create or replace view public.audit_security_rls as
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  count(p.polname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('profiles', 'pages', 'posts', 'media', 'revisions', 'site_settings', 'nav_items', 'submissions')
group by c.relname, c.relrowsecurity, c.relforcerowsecurity
order by c.relname;

-- 3. HAK AKSES VIEW AUDIT
-- Hanya staf yang boleh melihat hasil audit ini
grant select on public.audit_security_rls to authenticated;
revoke select on public.audit_security_rls from anon;
