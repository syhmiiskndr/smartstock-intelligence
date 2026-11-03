# SmartStock voice app (Apple-style prototype)

A voice-first UI that is drawn once and shared by every page.

```
src/smartstock/
  engine.js         data, state, voice parser, approvals, dock, Dynamic Island (shared by all pages)
  voice.css         all styles, every rule scoped under #ss-root (cannot affect other pages)
  markup.js         static shell markup (header, stage, island, dock, login)
  useVoicePage.js   hook used by the page files, builds the UI once and switches scene
  scenes/           one file per page, picked up automatically (import.meta.glob)
src/pages/*.jsx  one tiny page per route, same pattern as the other pages
```

| Route | Page file | Scene file |
|---|---|---|
| `/login` | `Login.jsx` | (login overlay is in the engine) |
| `/` | `Home.jsx` | `scenes/home.js` |
| `/stock` | `Stock.jsx` | `scenes/stock.js` |
| `/cost` | `Cost.jsx` | `scenes/cost.js` |
| `/fresh` | `Fresh.jsx` | `scenes/fresh.js` |
| `/approvals` | `Approvals.jsx` | `scenes/ops.js` |
| `/people` | `People.jsx` | `scenes/people.js` |
| `/rules` | `Rules.jsx` | `scenes/rules.js` |

Each page branch only adds its own page file and scene file. A page whose scene file is missing shows a "Not available yet" card.

A scene file exports `function (api)` and returns `{ sceneName: () => htmlString }`. `api` gives it the shared helpers (`S` state, `L(en, ms)` for English/Malay, `P` products, `rm`, `eta`, ...).
Voice works with the Web Speech API (Chrome or Edge, https or localhost). All data is sample data.
