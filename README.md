# SmartStock Intelligence (web)

Responsive web app for SmartStock Intelligence: inventory management with AI-assisted visual freshness
classification. This is the clickable front-end prototype. It uses sample data only; the Supabase
database, login and the Teachable Machine model are connected in later branches.

## Run it

```bash
npm install
npm run dev      # development server, normally http://localhost:5173
npm run build    # production build into dist/
```

Requires Node.js 18 or newer.

## Pages

| Route | Page |
|---|---|
| `/` | Landing page with an interactive freshness demo |
| `/login` | Log in |
| `/dashboard` | Dashboard |
| `/products`, `/products/detail` | Products and product detail |
| `/stock` | Stock in and out |
| `/adjustments` | Adjustments and history |
| `/alerts` | Alerts |
| `/inspect` | AI freshness inspection |
| `/history` | Inspection history |
| `/reports` | Reports |
| `/users` | Users and roles |
| `/settings` | Settings |

## How the code is organised

```
src/
  main.jsx            starts React and the router
  App.jsx             finds every file in src/pages and creates its route
  index.css           global styles only
  lib/DCLogic.jsx     small base class used by the pages
  components/         shared parts (Sidebar)
  pages/              one JSX file and one CSS file per page
```

Each page file exports `path` (its URL), `title` (the browser tab title) and the page component.
To add a page, create a new file in `src/pages` that exports these. No other file needs editing.
Page styles are scoped with a `pg-<name>` class, so two pages can both have a `.btn` without clashing.

## Working with Git

One branch per part, merged through a pull request. See `GIT_WORKFLOW.md` for the exact commands.

## Environment variables

Copy `.env.example` to `.env` and fill in your own values. `.env` is never committed.
Only the Supabase project URL and the anon key may be used in this app. Never put the service_role key here.
