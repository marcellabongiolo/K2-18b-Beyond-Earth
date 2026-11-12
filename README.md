# K2-18b: Beyond Earth

**Mission 01 — Orbital Reconnaissance** · A cinematic, science-aware exoplanet exploration experience.

## Features

- Interactive 3D planet with atmospheric layers and cinematic lighting.
- Drag to orbit and scroll/pinch to zoom; auto-rotation and damping.
- Star field, responsive mission HUD, scientific information panel.
- Explicit distinction between observed data, hypotheses and artistic simulations.
- Automated tests and GitHub Actions CI.

> **Scientific integrity:** K2-18 b is real, but its appearance here is fictional. Liquid oceans and extraterrestrial life have **not** been confirmed. The scene is not to scale.

## Run locally (Windows / VS Code)

Install Node.js 20+, open the repository in VS Code and run:

```powershell
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:5173).

```powershell
npm test
npm run build
```

## Architecture

- `src/main.tsx`: React app, Three.js scene, controls and mission UI.
- `src/science.ts`: science data and evidence classifications.
- `src/style.css`: responsive styling.
- `tests/science.test.ts`: unit tests.
- `.github/workflows/ci.yml`: tests and build in CI.

## Roadmap

1. Orbital Reconnaissance — first implementation.
2. Atmospheric Entry — planned.
3. Ocean Probe — hypothetical environment and pilotable probe, planned.
4. Astrobiology Lab — observations and uncertainty, planned.
5. Onboard AI — scientifically grounded copilot, planned.

## Science references

- [NASA Exoplanet Catalog](https://science.nasa.gov/exoplanet-catalog/k2-18-b/)
- [NASA Webb observations](https://science.nasa.gov/missions/webb/webb-discovers-methane-carbon-dioxide-in-atmosphere-of-k2-18-b/)

## License

No license has been selected yet; all rights reserved until one is added.
