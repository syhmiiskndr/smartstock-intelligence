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
| `/login` | `Login.jsx` | (login overlay is in the engine): one form, the role comes from the account. Accounts `admin` / `admin` and `staff` / `staff` have a fixed role. `demo` / `demo` is presentation mode: it shows the Admin/Staff switch and the 1-minute demo, which no other account sees |
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

## Phone, tablet and desktop

One codebase, no separate mobile site. The browser picks the layout from the screen width (CSS media queries in `voice.css`, bottom of the file):

| Device | Width | What changes |
|---|---|---|
| Phone | up to 640px | Full-width dock that scrolls sideways (mic orb always visible), item sheet fills the screen, one-column widgets |
| Tablet | 641px to 1024px | 2 and 3 column home widgets, floating dock like desktop |
| Desktop | 1025px and up | Original layout, unchanged |

Touch is detected separately from width: `(hover: none)` turns off hover and 3D tilt effects, `(pointer: coarse)` makes buttons bigger. `#ss-root` gets a `data-device` attribute (`phone`, `tablet` or `desktop`) that follows the screen size, and the keyboard height is exposed as `--kb` so the typing box and login form stay above the phone keyboard.
