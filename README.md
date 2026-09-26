# Nyxers Music Studio

**Platenlabel NyxersMusicProduction · René Oosting**

Productie-klare SPA voor originele Nederlandse music production: songwriter → producer → kick lab → mastering → album → festival blueprint → videoclip → WAV/MP3 export.

> Originele generaties · geen voice-clones · geen covers van bestaande tracks

## Starten

```bash
cd /workspace/nyxers-music-studio
npm install
npm run dev
```

Open de URL die Vite toont (meestal `http://localhost:5173`).

Productie-build:

```bash
npm run build
npm run preview
```

## MP3 / WAV exporteren

1. Open of maak een project op **Studio Home**
2. Pas eventueel lyrics, arrangement, kick en mastering aan
3. Ga naar **Export**
4. Kies het aantal bars (lengte)
5. Klik **Download WAV** of **Download MP3**

De audio wordt volledig in de browser gegenereerd via `OfflineAudioContext` en gecodeerd met **lamejs** (MP3). Geen server nodig.

Album: **Album Builder** → **Download album ZIP (MP3)**.

Project blueprint: **Download project JSON** op de Export-pagina. Projecten worden ook in `localStorage` bewaard.

## Genre DNA presets

| # | Preset | BPM |
|---|--------|-----|
| 1 | Classic Gabber / Mainstream HC | 165–175 |
| 2 | Uptempo Hardcore | 200–230 |
| 3 | Industrial Hardcore | 170–185 |
| 4 | Happy Hardcore / early Rotterdam | 160–170 |
| 5 | Nederhop / streetrap | 85–100 |
| 6 | Piratenhits / feest | 120–140 |
| 7 | Nederpop schlager / emotionele ballad | 70–95 |
| 8 | Metal / hardrock | 120–160 |
| 9 | Festival Hardstyle crossover | 145–155 |
| 10 | Gabber-Nederhop hybrid | 90–175 |

Style-tags beschrijven sfeer (bijv. “in de sfeer van Nederlandse uptempo hardcore”), nooit als clone van een artiest.

## Modules

- **Studio Home** — projecten + nieuwe-track wizard + demo’s
- **Songwriter** — NL lyrics (templates + rijm-engine)
- **Producer** — arrangement, BPM, key, energy, preview
- **Kick Lab** — pitch-drop kick, distortion, rolls, drops
- **Mastering** — LUFS, limiter, EQ-presets, sidechain-feel
- **Album Builder** — tracklist + ZIP export
- **Live / Festival** — setlist & drop cues (arena hardcore festival)
- **Videoclip Director** — shotlist + AI prompt pack
- **Export** — live preview, WAV, MP3, JSON

## Optionele AI-hook

Zet in `.env`:

```env
VITE_ELEVENLABS_API_KEY=
VITE_MUSICAPI_KEY=
```

Als een key aanwezig is, verschijnt **AI Full Track** op de Export-pagina. Zonder key werkt de volledige lokale synth-engine gewoon.

## Tech stack

- Vite + React + TypeScript
- Tone.js (afhankelijkheid aanwezig; core playback via Web Audio / OfflineAudioContext)
- lamejs (MP3), JSZip (album), file-saver
- HashRouter, localStorage
- UI: nl-NL, dark festival / black-neon

## Demo projecten

1. **Kind van de nacht** — uptempo hardcore NL  
2. **Havens van Rotterdam** — classic gabber  
3. **Zoveel druk** — Nederhop street energy  

## Licentie / juridisch

Alle gegenereerde teksten en arrangementen zijn procedureel/origineel. Gebruik geen voice-clones en geen covers van bestaande tracks. Merknamen van festivals worden vermeden; we spreken van “arena hardcore festival”.
