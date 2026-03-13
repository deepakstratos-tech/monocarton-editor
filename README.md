cat > /Users/deepakverma/Documents/monocarton-editor/README.md << 'EOF'
# Mono — Monocarton Imposition Planner

A full stack web tool for packaging professionals to calculate and visualise optimal carton layouts on print sheets.

Live: https://deepakstratos-tech.github.io/monocarton-editor

## What it does
Mono helps you calculate how many cartons fit on a print sheet and visualises the optimal layout — supporting both Straight and Tumble imposition. Layout calculations happen server-side via the Mono Backend API.

## Tech Stack
- React
- Fabric.js — interactive canvas rendering
- Hosted on GitHub Pages
- Backend: FastAPI on Railway

## Features
- Straight layout — all cartons same direction
- Tumble layout — alternate rows flipped 180° with nesting saving
- Interactive canvas — drag cartons to adjust manually
- SVG export — for Illustrator and Esko
- DXF export — for ArtiosCAD and AutoCAD
- Live backend status indicator
- All calculations performed server-side

## Local Setup

### Prerequisites
- Node.js 18+
- NVM recommended

### Install and run
```bash
nvm use 18
npm install
npm start
```

App will open at `http://localhost:3000`

### Connect to backend
In `App.js`, set:
```javascript
const API_BASE = "http://127.0.0.1:8000"; // local
// or
const API_BASE = "https://web-production-e59f.up.railway.app"; // production
```

## Deployment

### Deploy to GitHub Pages
```bash
npm run deploy
```

Make sure `homepage` in `package.json` is set to:
```
https://deepakstratos-tech.github.io/monocarton-editor
```

## Start Everything Locally
From the Documents folder:
```bash
./start.sh
```
This opens two terminal windows — one for the backend and one for the frontend.

## Domain Knowledge
- Carton flat size includes glue flaps, tuck flaps, and bleed
- Tumble layout flips alternate rows 180° so profiles nest into each other
- Nesting saving percentage depends on physical carton profile
- Border margin applied on all 4 sides
- Press constraints include gripper and side lay allowances

## Changelog
- v1.1 — Backend moved to Railway, Tier 2 algorithms added
- v1.0 — Initial release with Straight and Tumble layout

## Built by
Deepak — powered by FastAPI + Fabric.js
EOF