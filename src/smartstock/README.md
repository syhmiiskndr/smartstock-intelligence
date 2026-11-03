# SmartStock voice app (Apple-style prototype)

A voice-first UI that is drawn once and shared by every `/voice/*` page.

```
src/smartstock/
  engine.js         data, state, voice parser, approvals, dock, Dynamic Island (shared by all pages)
  voice.css         all styles, every rule scoped under #ss-root (cannot affect other pages)
  markup.js         static shell markup (header, stage, island, dock, login)
  useVoicePage.js   hook used by the page files, builds the UI once and switches scene
  scenes/           one file per page, picked up automatically (import.meta.glob)
src/pages/Voice*.jsx  one tiny page per route, same pattern as the other pages
```

| Route | Page file | Scene file |
|---|---|---|
| `/voice/login` | `VoiceLogin.jsx` | (login overlay is in the engine) |
| `/voice` | `VoiceHome.jsx` | `scenes/home.js` |
| `/voice/stock` | `VoiceStock.jsx` | `scenes/stock.js` |
| `/voice/cost` | `VoiceCost.jsx` | `scenes/cost.js` |
| `/voice/fresh` | `VoiceFresh.jsx` | `scenes/fresh.js` |
| `/voice/approvals` | `VoiceApprovals.jsx` | `scenes/ops.js` |
| `/voice/people` | `VoicePeople.jsx` | `scenes/people.js` |
| `/voice/rules` | `VoiceRules.jsx` | `scenes/rules.js` |

Merge `feature/voice-engine` first. After that every page branch is independent: a page whose scene file is not merged yet shows a "Not available yet" card.

A scene file exports `function (api)` and returns `{ sceneName: () => htmlString }`. `api` gives it the shared helpers (`S` state, `L(en, ms)` for English/Malay, `P` products, `rm`, `eta`, ...).
Voice works with the Web Speech API (Chrome or Edge, https or localhost). All data is sample data.
