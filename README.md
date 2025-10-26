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

To run Chronicles of the Kethaneum locally, you need to serve the game using a static file server. This ensures ES modules and resources load correctly. You do **not** need npm or package scripts—just a simple static file server such as [http-server](https://www.npmjs.com/package/http-server).

1. **Install http-server (if you don’t have it):**
   ```bash
   npm install -g http-server
   ```
   (Or use `npx http-server` without installing globally.)

2. **Open your terminal and change to your game directory:**
   ```bash
   cd "Game Files"
   ```

3. **Start the server:**
   ```bash
   http-server . -c-1
   # or, if not installed globally:
   npx http-server . -c-1
   ```

4. **Visit the URL shown in the terminal (usually http://localhost:8080)**

You should see the title screen and be able to play the prototype!

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
    ├── moduleBootstrap.js  # Single entry-point bootstrap
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
* JSON story packs live in `public/`; new packs auto-loaded if named in `moduleBootstrap.js`’s `customPaths`.

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
* **Module import errors** → check import paths in `src/moduleBootstrap.js` and that your server serves `type="module"` scripts.
* **Test flakiness** → try resizing your test runner viewport or adding small timeouts around animations.

---

## 📋 Roadmap

* [ ] CI pipeline with Cypress + dev deploy
* [ ] Bundling & tree-shaking via Rollup or Vite
* [ ] Patreon-driven story pack loader
* [ ] Mobile-friendly layout & controls

---

## 👥 Team

* **Seraphine** (Creative Lead & Senior QA)
* **Sonny** (AI Lead Dev & Test Automation Wrangler)
* **Paper Pusher** (AI Technical Reviewer and Tech Lead)
* **Assembly** (AI Architecture Lead)
* **Blueberry** (AI Automation & Build Scripts Lead)
