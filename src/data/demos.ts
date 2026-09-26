import type { TrackProject, Album } from '../types';
import { getGenre } from './genres';
import { generateLyrics } from './lyricsEngine';

function demo(
  id: string,
  title: string,
  theme: string,
  genreId: TrackProject['genreId'],
  notes: string,
): TrackProject {
  const g = getGenre(genreId);
  const now = new Date().toISOString();
  return {
    id,
    title,
    theme,
    genreId,
    bpm: g.defaultBpm,
    key: g.defaultKey,
    createdAt: now,
    updatedAt: now,
    lyrics: generateLyrics(title, theme, genreId),
    arrangement: g.arrangementBlueprint.map((b) => ({ ...b })),
    kick: { ...g.kick },
    energyCurve: g.arrangementBlueprint.map((b) => b.energy),
    master: { ...g.master },
    durationBars: g.arrangementBlueprint.reduce((s, b) => s + b.bars, 0),
    notes,
  };
}

export const DEMO_PROJECTS: TrackProject[] = [
  demo(
    'demo-kind-van-de-nacht',
    'Kind van de nacht',
    'nacht arena uptempo',
    'uptempo',
    'Demo: uptempo hardcore NL — kickrolls, raspy mid-kick, arena-energie.',
  ),
  demo(
    'demo-havens-rotterdam',
    'Havens van Rotterdam',
    'stad haven trots',
    'classic-gabber',
    'Demo: classic gabber — overdriven 4/4, Rotterdam roots.',
  ),
  demo(
    'demo-zoveel-druk',
    'Zoveel druk',
    'straat hustle trots',
    'nederhop',
    'Demo: Nederhop street energy — half-time, warme sub, NL flow.',
  ),
];

export const DEMO_ALBUM: Album = {
  id: 'album-nyxers-demo',
  title: 'Nyxers Demo Tape Vol. 1',
  artist: 'Platenlabel NyxersMusicProduction',
  year: 2026,
  coverNote: 'Zwart-neon festival artwork · Originele generaties',
  trackIds: DEMO_PROJECTS.map((p) => p.id),
};
