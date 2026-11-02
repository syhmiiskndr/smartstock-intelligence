# SmartStock Intelligence – Apple-style prototype

Static prototype (no build step). Files:
- `index.html`  markup (header, stage, dock, panels, drawer, login)
- `style.css`   all styling, design tokens at the top (`:root`, light/dark)
- `app.js`      all logic in one IIFE: data, scenes, voice parser, rules, dock, Dynamic Island

Run: open `index.html` in Chrome/Edge (real mic works), or `npx serve .`
For a Vite repo: copy the three files into `public/smartstock/` and open `/smartstock/index.html`.

Voice: Web Speech API (en-US / ms-MY). Needs Chrome/Edge and https or localhost.
All figures are sample data. Inside `app.js` the sections are: data/state, i18n `L(en,ms)`, scenes, command parser `run`, draft/commit/approval flow, rules, login, Apple layer (dock, island, tilt, segmented controls).
