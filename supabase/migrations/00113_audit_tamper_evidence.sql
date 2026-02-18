-- ============================================================================
-- Migration 00113: Tamper-evident append-only audit chain
-- ============================================================================
-- Hardening goals:
-- 1) Durable persistence for enterprise audit records
-- 2) Cryptographic hash-chain integrity per organization
-- 3) Immutable (append-only) audit log behavior
-- ============================================================================

create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Canonical helper to compute sha256 hash regardless of pgcrypto schema placement.
create or replace function public.audit_sha256(p_input text)
returns text
language plpgsql
immutable
as $$
begin
  if to_regprocedure('public.digest(bytea,text)') is not null then
    return encode(public.digest(convert_to(p_input, 'UTF8'), 'sha256'), 'hex');
  elsif to_regprocedure('extensions.digest(bytea,text)') is not null then
    return encode(extensions.digest(convert_to(p_input, 'UTF8'), 'sha256'), 'hex');
  else
    raise exception 'pgcrypto digest function is unavailable';
  end if;
end;
$$;

alter table audit_logs add column if not exists "timestamp" timestamptz;
alter table audit_logs add column if not exists request_id text;
alter table audit_logs add column if not exists correlation_id text;
alter table audit_logs add column if not exists retention_until timestamptz;
alter table audit_logs add column if not exists previous_hash text;
alter table audit_logs add column if not exists integrity_hash text;
alter table audit_logs add column if not exists hash_algorithm text not null default 'sha256';

create index if not exists idx_audit_logs_request_id on audit_logs(request_id);
create index if not exists idx_audit_logs_correlation_id on audit_logs(correlation_id);
create index if not exists idx_audit_logs_integrity_hash on audit_logs(integrity_hash);
create index if not exists idx_audit_logs_org_ts on audit_logs(organization_id, coalesce("timestamp", created_at) desc);

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only; updates and deletes are prohibited';
end;
$$;

drop trigger if exists trg_prevent_audit_log_update on audit_logs;
create trigger trg_prevent_audit_log_update
before update on audit_logs
for each row
execute function public.prevent_audit_log_mutation();

drop trigger if exists trg_prevent_audit_log_delete on audit_logs;
create trigger trg_prevent_audit_log_delete
before delete on audit_logs
for each row
execute function public.prevent_audit_log_mutation();

create or replace function public.append_audit_log(
  p_organization_id uuid,
  p_user_id uuid,
  p_user_email text,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb,
  p_new_values jsonb,
  p_ip_address inet,
  p_user_agent text,
  p_metadata jsonb,
  p_request_id text,
  p_correlation_id text,
  p_retention_until timestamptz
)
returns table (
  id uuid,
  previous_hash text,
  integrity_hash text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_prev_hash text;
  v_integrity_hash text;
  v_event_timestamp timestamptz := now();
  v_payload text;
begin
  -- Lock the last hash row for this organization to make chain insertion deterministic.
  select al.integrity_hash
    into v_prev_hash
  from audit_logs al
  where al.organization_id = p_organization_id
  order by coalesce(al."timestamp", al.created_at) desc, al.id desc
  limit 1
  for update;

  v_payload := jsonb_build_object(
    'organization_id', p_organization_id,
    'user_id', p_user_id,
    'user_email', p_user_email,
    'action', p_action,
    'entity_type', p_entity_type,
    'entity_id', p_entity_id,
    'old_values', coalesce(p_old_values, '{}'::jsonb),
    'new_values', coalesce(p_new_values, '{}'::jsonb),
    'ip_address', p_ip_address,
    'user_agent', p_user_agent,
    'metadata', coalesce(p_metadata, '{}'::jsonb),
    'request_id', p_request_id,
    'correlation_id', p_correlation_id,
    'timestamp', v_event_timestamp
  )::text;

  v_integrity_hash := public.audit_sha256(
    coalesce(v_prev_hash, 'GENESIS') || ':' || v_payload
  );

  insert into audit_logs (
    organization_id,
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    metadata,
    request_id,
    correlation_id,
    retention_until,
    previous_hash,
    integrity_hash,
    hash_algorithm,
    "timestamp"
  )
  values (
    p_organization_id,
    p_user_id,
    p_user_email,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    coalesce(p_metadata, '{}'::jsonb),
    p_request_id,
    p_correlation_id,
    p_retention_until,
    v_prev_hash,
    v_integrity_hash,
    'sha256',
    v_event_timestamp
  )
  returning audit_logs.id, audit_logs.previous_hash, audit_logs.integrity_hash
  into id, previous_hash, integrity_hash;

  return next;
end;
$$;

grant execute on function public.append_audit_log(
  uuid, uuid, text, text, text, uuid, jsonb, jsonb, inet, text, jsonb, text, text, timestamptz
) to authenticated, service_role;
