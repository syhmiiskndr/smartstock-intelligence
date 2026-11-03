# SmartStock Intelligence (web)

Voice-first web app for small food businesses: stock levels, freshness, costs, approvals and rules,
controlled mostly by speaking (English or Bahasa Melayu). Apple-style interface with a dock, Dynamic Island
and level bars. This is the front-end prototype and uses sample data only; Supabase and the
Teachable Machine freshness model are connected in later branches.

## Run it

```bash
npm install
npm run dev      # development server, normally http://localhost:5173
npm run build    # production build into dist/
```

Requires Node.js 18 or newer. Use Chrome or Edge for the real microphone (needs https or localhost).

## Pages

| Route | Page file | Scene file |
|---|---|---|
| `/` | `src/pages/Home.jsx` | `src/smartstock/scenes/home.js` |
| `/login` | `Login.jsx` | (in the engine) |
| `/stock` | `Stock.jsx` | `scenes/stock.js` |
| `/cost` | `Cost.jsx` | `scenes/cost.js` |
| `/fresh` | `Fresh.jsx` | `scenes/fresh.js` |
| `/approvals` | `Approvals.jsx` | `scenes/ops.js` |
| `/people` | `People.jsx` | `scenes/people.js` |
| `/rules` | `Rules.jsx` | `scenes/rules.js` |

Every file in `src/pages` exports `path`, `title` and a default component, and `App.jsx` adds the route
automatically. The shared engine, styles and page hook are in `src/smartstock` (see its README).

## Deploy

Netlify: build command `npm run build`, publish directory `dist`. `public/_redirects` sends every path to
`index.html` so direct links such as `/stock` work.
