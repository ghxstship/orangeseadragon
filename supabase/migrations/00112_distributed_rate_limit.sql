-- ============================================================================
-- Migration 00112: Distributed Rate Limiting
-- ============================================================================
-- Adds a PostgreSQL-backed token bucket function used by middleware and API
-- routes for consistent multi-instance rate limiting.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key TEXT PRIMARY KEY,
  tokens NUMERIC NOT NULL,
  last_refill TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated_at
  ON public.rate_limit_buckets (updated_at);

ALTER TABLE public.rate_limit_buckets DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM anon, authenticated;
GRANT ALL ON TABLE public.rate_limit_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_tokens INTEGER,
  p_refill_rate NUMERIC
)
RETURNS TABLE(allowed BOOLEAN, retry_after INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc', now());
  v_tokens NUMERIC;
  v_last_refill TIMESTAMPTZ;
  v_elapsed_seconds NUMERIC;
  v_refilled_tokens NUMERIC;
BEGIN
  IF p_key IS NULL OR p_key = '' THEN
    RAISE EXCEPTION 'p_key is required';
  END IF;

  IF p_max_tokens <= 0 THEN
    RAISE EXCEPTION 'p_max_tokens must be > 0';
  END IF;

  IF p_refill_rate <= 0 THEN
    RAISE EXCEPTION 'p_refill_rate must be > 0';
  END IF;

  SELECT tokens, last_refill
  INTO v_tokens, v_last_refill
  FROM public.rate_limit_buckets
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limit_buckets (key, tokens, last_refill, updated_at)
    VALUES (
      p_key,
      GREATEST(0, p_max_tokens - 1),
      v_now,
      v_now
    )
    ON CONFLICT (key) DO UPDATE
    SET tokens = EXCLUDED.tokens,
        last_refill = EXCLUDED.last_refill,
        updated_at = EXCLUDED.updated_at;

    RETURN QUERY SELECT TRUE, 0;
    RETURN;
  END IF;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (v_now - v_last_refill));
  v_refilled_tokens := LEAST(
    p_max_tokens::NUMERIC,
    v_tokens + (v_elapsed_seconds * p_refill_rate)
  );

  IF v_refilled_tokens < 1 THEN
    UPDATE public.rate_limit_buckets
    SET tokens = v_refilled_tokens,
        last_refill = v_now,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY
    SELECT
      FALSE,
      GREATEST(1, CEIL((1 - v_refilled_tokens) / p_refill_rate)::INTEGER);
    RETURN;
  END IF;

  UPDATE public.rate_limit_buckets
  SET tokens = v_refilled_tokens - 1,
      last_refill = v_now,
      updated_at = v_now
  WHERE key = p_key;

  RETURN QUERY SELECT TRUE, 0;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, NUMERIC)
  TO anon, authenticated, service_role;
