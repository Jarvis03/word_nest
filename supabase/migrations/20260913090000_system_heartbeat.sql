create table public.system_heartbeat (
  id smallint primary key default 1 check (id = 1),
  last_seen_at timestamptz not null default now()
);

insert into public.system_heartbeat (id)
values (1)
on conflict (id) do nothing;

alter table public.system_heartbeat enable row level security;
revoke all on table public.system_heartbeat from public, anon, authenticated;

create or replace function public.record_system_heartbeat()
returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_last_seen_at timestamptz;
begin
  update public.system_heartbeat
  set last_seen_at = now()
  where id = 1
  returning last_seen_at into v_last_seen_at;

  return v_last_seen_at;
end;
$$;

revoke all on function public.record_system_heartbeat() from public;
grant execute on function public.record_system_heartbeat() to anon, authenticated;
