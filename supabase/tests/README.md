Local-only tests (never run on Supabase): start any Postgres 15+, then
`psql -f 00_stub_and_team_schema.sql`, `psql -f ../migrations/0002_backend_foundation.sql`, `psql -f 01_scenarios.sql`.
The stub fakes `auth.*` and the team's tables; the scenarios check RLS, FEFO usage, approvals, invites and company isolation.
