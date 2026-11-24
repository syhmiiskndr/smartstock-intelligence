Local-only tests (never run on Supabase): start any Postgres 15+, then
`psql -f 00_stub_and_team_schema.sql`, `psql -f ../migrations/0002_backend_foundation.sql`, `psql -f 01_scenarios.sql`.
The stub fakes `auth.*` and the team's tables; the scenarios check RLS, FEFO usage, approvals, invites and company isolation.

Order used locally: 00 stub, 0002, 0004, 0003 (after inserting owner/admin/staff @smartstock.test into auth.users), 0005, then
`01_scenarios.sql`, `02_week1.sql`, `03_demo.sql` (demo flag, `reset_demo()` permissions, empty new company + "load sample data").
`0006_forecast_engine.sql` runs after 0005; `04_forecast.sql` checks the learning ladder (rules/average/trend/weekday), stock-out days,
spoilage risk, draft purchase orders (no duplicates, approve/reject, no vendor, staff cannot approve) and company isolation.
`0007_daily_metrics.sql` runs after 0006; `05_metrics.sql` checks that the daily numbers behind every chart add up to the raw transactions.
