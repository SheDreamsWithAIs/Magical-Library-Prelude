# Chronicles of the Kethaneum

[![Release Version](https://img.shields.io/github/v/release/your-org/your-repo)](https://github.com/your-org/your-repo/releases)

*A co-creative word-puzzle adventure across realms.*

---

## 📖 Overview

Chronicles of the Kethaneum is a browser-based narrative puzzle game built in plain ES modules.  
Players explore themed “realms,” solve word-search puzzles, and unlock new story passages.  
Our architecture now cleanly separates:

- **Engine** (`src/gameLogic.js`, `src/puzzleGenerator.js`)  
- **UI** (`src/renderSystem.js`, `src/navigation.js`, `src/panelManager.js`)  
- **State & Persistence** (`src/gameState.js`, `src/saveSystem.js`)  
- **Utilities** (`src/domUtils.js`, `src/errorHandler.js`, `src/MathUtils.js`)  

---

## ▶️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 16  
- A static-file server (e.g. `npm install -g http-server`) or VS Code Live Server  

### Install & Run Locally

```bash
git clone https://github.com/your-org/kethaneum.git
cd kethaneum
npm install            # installs Cypress & any build tools
npm start              # e.g. `http-server . -c-1` or your custom script
# then open http://localhost:8080 (or port shown)
````

### Run the Tests

```bash
npx cypress run --browser chrome --headless
```

---

## 🗂️ Project Structure

```
/
├── public/                 # Static assets & story JSON packs
│   ├── kethaneumPuzzles.json
│   └── naturePuzzles.json
└── src/
    ├── app.js              # Single entry-point bootstrap
    ├── configModule.js     # Game settings (grid sizes, time limits)
    ├── gameState.js        # Core state singleton
    ├── saveSystem.js       # localStorage persistence
    ├── gameLogic.js        # Puzzle & timer logic
    ├── puzzleLoader.js     # JSON fetch & parse
    ├── puzzleGenerator.js  # Word-list generation
    ├── renderSystem.js     # DOM updates & templates
    ├── navigation.js       # Screen transitions
    ├── inputHandler.js     # Click & key listeners
    ├── errorHandler.js     # Central error-panel UI
    ├── domUtils.js         # Helper functions for DOM ops
    └── MathUtils.js        # Shared math helpers
```

---

## ⚙️ Configuration

* Edit `src/configModule.js` to tweak puzzle sizes, time limits, theme colors, etc.
* JSON story packs live in `public/`; new packs auto-loaded if named in `app.js`’s `customPaths`.

---

## 🚀 Deployment

1. Build (if you add bundling later):

   ```bash
   npm run build         # e.g. Rollup/Vite → `dist/app.bundle.js`
   ```
2. Push to GitHub → GitHub Pages auto-deploy on `main`.
3. (Optional) Tag a release and use Butler to push to Itch.io.

---

## 🔧 Troubleshooting

* **404 on puzzle JSON** → ensure your story files are in `public/` (same folder as `index.html`), or adjust `import.meta.url` paths.
* **Module import errors** → check import paths in `src/app.js` and that your server serves `type="module"` scripts.
* **Test flakiness** → try resizing your test runner viewport or adding small timeouts around animations.

---

## 📋 Roadmap

* [ ] CI pipeline with Cypress + dev deploy
* [ ] Bundling & tree-shaking via Rollup or Vite
* [ ] Patreon-driven story pack loader
* [ ] Mobile-friendly layout & controls
* [ ] Confluence Workshop prototype integration

---

## 👥 Team

* **Seraphine** (Creative Lead & Senior QA)
* **Sonny** (Lead Dev & Test Automation Wrangler)
* **Paper Pusher** (Technical Reviewer and Tech Lead)
* **Assembly** (Architecture Lead)
* **Blueberry** (Automation & Build Scripts)
