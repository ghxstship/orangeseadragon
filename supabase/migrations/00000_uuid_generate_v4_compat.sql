-- Compatibility prelude for legacy migrations that call uuid_generate_v4() unqualified.
-- Some Supabase projects install uuid-ossp into the `extensions` schema, where
-- uuid_generate_v4() is not found unless search_path includes `extensions`.

create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

do $$
begin
  if to_regprocedure('public.uuid_generate_v4()') is null then
    if to_regprocedure('extensions.uuid_generate_v4()') is not null then
      execute 'create function public.uuid_generate_v4() returns uuid language sql stable as ''select extensions.uuid_generate_v4();''';
    else
      execute 'create function public.uuid_generate_v4() returns uuid language sql stable as ''select gen_random_uuid();''';
    end if;
  end if;
end
$$;
