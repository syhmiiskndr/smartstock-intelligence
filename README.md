# SmartStock Intelligence (web)

Voice-first web app for small food businesses: stock levels, freshness, costs, approvals and rules,
controlled mostly by speaking (English or Bahasa Melayu). Apple-style interface with a dock, Dynamic Island
and level bars. Front-end prototype with sample data only; Supabase and the Teachable Machine freshness
model are connected in later branches.

## Run it

```bash
npm install
npm run dev      # development server, normally http://localhost:5173
npm run build    # production build into dist/
```

Requires Node.js 18 or newer. Use Chrome or Edge for the real microphone (needs https or localhost).

## Pages

| Route | File |
|---|---|
| `/` | `src/pages/Home.jsx` |
| `/login` | `src/pages/Login.jsx` |
| `/stock` | `src/pages/Stock.jsx` |
| `/cost` | `src/pages/Cost.jsx` |
| `/fresh` | `src/pages/Fresh.jsx` |
| `/approvals` | `src/pages/Approvals.jsx` |
| `/people` | `src/pages/People.jsx` |
| `/rules` | `src/pages/Rules.jsx` |

Every file in `src/pages` exports `path`, `title` and a default component. `App.jsx` adds the route automatically
and wraps every page in `AppShell`, so adding a page file is all it takes.

## Project structure

```
src/
  App.jsx                 routes (reads src/pages), wraps pages in AppShell
  components/
    AppShell.jsx          header, tools, page outlet, and the pieces below
    Dock.jsx              macOS-style dock with magnification and the voice orb
    Island.jsx            Dynamic Island: voice state, hints, live alerts
    Panel.jsx             floating answer / confirmation card
    CmdBar.jsx            typed command bar
    Drawer.jsx            item inspector sheet
    LoginScreen.jsx       lock-screen sign in
    Seg.jsx, RingSet.jsx, OrderTracking.jsx, Tip.jsx
  store/
    data.js               sample products, state, constants
    store.jsx             shared state, voice command parser, approvals, all actions
  lib/                    format helpers and icons
  styles/smartstock.css   all styles, scoped under #ss-root
```

State lives in `src/store/store.jsx`. Components call `useStore()` to re-render when it changes and call the exported
functions (`run`, `go`, `speakSim`, `commit`, `decide`, ...) to act. `L(en, ms)` returns text in the current language.

## Deploy

Netlify: build command `npm run build`, publish directory `dist`. `public/_redirects` sends every path to
`index.html` so direct links such as `/stock` work.
