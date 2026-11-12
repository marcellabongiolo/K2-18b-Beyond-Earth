# K2-18b: Beyond Earth

## 🌌 Explore the interactive experience

**[🚀 OPEN THE LIVE 3D EXPERIENCE](https://marcellabongiolo.github.io/K2-18b-Beyond-Earth/)**

Visit the interactive planet, pilot the AURORA-01 probe, experience atmospheric approach, and explore a fictional underwater environment. The site is deployed automatically via GitHub Actions after GitHub Pages is enabled in **Settings → Pages → Source: GitHub Actions**.


**Mission 01 — Orbital Reconnaissance** · A cinematic, science-aware exoplanet exploration experience.

## Mission 02 — Probe Telemetry (in development)

- Stylized 3D reconnaissance probe with solar panels and animated drift.
- Interactive approach/retreat, visibility toggle and scan progress.
- Illustrative signal telemetry and safe distance limits.
- No fabricated evidence of extraterrestrial life: the scan explicitly states that life is unconfirmed.
- Additional deterministic unit tests for mission navigation.

**Note:** Probe telemetry, distance units, and scan progress are fictional interface elements, not measurements from K2-18 b.

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
2. Probe Telemetry — implementation in progress; atmospheric entry planned next.
3. Ocean Probe — hypothetical environment and pilotable probe, planned.
4. Astrobiology Lab — observations and uncertainty, planned.
5. Onboard AI — scientifically grounded copilot, planned.

## Science references

- [NASA Exoplanet Catalog](https://science.nasa.gov/exoplanet-catalog/k2-18-b/)
- [NASA Webb observations](https://science.nasa.gov/missions/webb/webb-discovers-methane-carbon-dioxide-in-atmosphere-of-k2-18-b/)

## License

No license has been selected yet; all rights reserved until one is added.

## Mission 03 — Atmospheric Approach (in development)

Use **Iniciar aproximação** to transition from orbital view to a cinematic close-up of the planet. **Visão orbital** restores the wider perspective. The atmospheric haze is intentionally speculative, not an observed cloud map or proof of oceans or life. This milestone adds a reversible camera transition, visual atmospheric layers and unit tests for flight phase logic.


## Mission 04 — Hypothetical Ocean Exploration

Switch to **Oceano hipotético** to enter a fictional underwater environment. Pilot the AURORA-02 submersible with dive, ascend, left/right rotation, sample collection, and reset controls. Features include animated particles, glowing imaginary organisms, underwater fog, and a stylized submersible. Navigation and sample limits are unit-tested.

**IMPORTANT:** No ocean, underwater life, organisms, or collected samples have been confirmed on K2-18 b. The entire ocean environment is speculative science fiction. Depth uses arbitrary simulation units (U), not meters. The visual scene is an artistic representation, not a validated physical model.


## Visual fidelity upgrade

The orbital view now uses deterministic, procedurally generated color variation and drifting atmospheric layers, rather than a flat blue sphere. The speculative underwater environment includes a detailed rocky floor, mineral-like formations, and richer suspended particles. These are **fictional artistic details**, not observed terrain, atmospheric imagery, or life on K2-18 b. The texture is generated in the browser without downloading satellite or telescope images.

## Cinematic realism pass (visual only)

The planet gains finer multi-scale atmospheric turbulence and a stylized cyclonic feature. The underwater scene gains a sculpted 3D seabed and translucent light shafts. These are **procedural artistic approximations**, not observed images or a physically validated rendering of K2-18 b. The hypothetical ocean and organisms remain entirely fictional.

## Cinematic lighting pass

Orbital and underwater renderers use ACES filmic tone mapping, sRGB output and more directional lighting to improve contrast and depth. Visuals are artistic simulations, not actual images of K2-18 b; oceans and life have not been confirmed.
