-- Run in the Supabase SQL editor (dashboard → SQL). Fast-follows from the
-- 2026-07-21 security review of the rate limiter (lib/rateLimit.ts):
--
-- 1) Indexes so the limiter's three count queries stay fast even if the public
--    /api/event endpoint is flooded (slow counts time out → limiter fails open).
create index if not exists events_type_session_created_idx
  on events (type, session_id, created_at);
create index if not exists events_type_ip_created_idx
  on events (type, (payload->>'ip'), created_at);

-- 2) Retention: model_call rows carry the caller IP (PII) and are useless to
--    the limiter after 24h. Purge anything older than 7 days. Schedule this via
--    Supabase cron (pg_cron) or run it by hand now and then:
--      select cron.schedule('purge-model-calls', '17 4 * * *',
--        $$delete from events where type = 'model_call' and created_at < now() - interval '7 days'$$);
delete from events where type = 'model_call' and created_at < now() - interval '7 days';
