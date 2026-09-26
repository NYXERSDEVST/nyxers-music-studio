import type { Album, AppState, GenreId, TrackProject } from '../types';
import { DEMO_ALBUM, DEMO_PROJECTS } from '../data/demos';
import { getGenre } from '../data/genres';
import { generateLyrics } from '../data/lyricsEngine';

const STORAGE_KEY = 'nyxers-music-studio-v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.projects?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return {
    projects: DEMO_PROJECTS.map((p) => ({ ...p })),
    albums: [{ ...DEMO_ALBUM, trackIds: [...DEMO_ALBUM.trackIds] }],
    activeProjectId: DEMO_PROJECTS[0].id,
  };
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState(): AppState {
  return state;
}

export function setActiveProject(id: string | null) {
  state = { ...state, activeProjectId: id };
  persist();
}

export function getActiveProject(): TrackProject | null {
  return state.projects.find((p) => p.id === state.activeProjectId) ?? null;
}

export function upsertProject(project: TrackProject) {
  const idx = state.projects.findIndex((p) => p.id === project.id);
  const projects = [...state.projects];
  const updated = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) projects[idx] = updated;
  else projects.unshift(updated);
  state = { ...state, projects, activeProjectId: updated.id };
  persist();
}

export function deleteProject(id: string) {
  state = {
    ...state,
    projects: state.projects.filter((p) => p.id !== id),
    albums: state.albums.map((a) => ({
      ...a,
      trackIds: a.trackIds.filter((t) => t !== id),
    })),
    activeProjectId: state.activeProjectId === id ? state.projects[0]?.id ?? null : state.activeProjectId,
  };
  persist();
}

export function createProject(opts: {
  title: string;
  theme: string;
  genreId: GenreId;
}): TrackProject {
  const g = getGenre(opts.genreId);
  const now = new Date().toISOString();
  const project: TrackProject = {
    id: `track-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: opts.title,
    theme: opts.theme,
    genreId: opts.genreId,
    bpm: g.defaultBpm,
    key: g.defaultKey,
    createdAt: now,
    updatedAt: now,
    lyrics: generateLyrics(opts.title, opts.theme, opts.genreId),
    arrangement: g.arrangementBlueprint.map((b) => ({ ...b })),
    kick: { ...g.kick },
    energyCurve: g.arrangementBlueprint.map((b) => b.energy),
    master: { ...g.master },
    durationBars: g.arrangementBlueprint.reduce((s, b) => s + b.bars, 0),
    notes: '',
  };
  upsertProject(project);
  return project;
}

export function updateActive(patch: Partial<TrackProject>) {
  const cur = getActiveProject();
  if (!cur) return;
  upsertProject({ ...cur, ...patch });
}

export function upsertAlbum(album: Album) {
  const idx = state.albums.findIndex((a) => a.id === album.id);
  const albums = [...state.albums];
  if (idx >= 0) albums[idx] = album;
  else albums.push(album);
  state = { ...state, albums };
  persist();
}

export function resetToDemos() {
  state = {
    projects: DEMO_PROJECTS.map((p) => ({ ...p })),
    albums: [{ ...DEMO_ALBUM, trackIds: [...DEMO_ALBUM.trackIds] }],
    activeProjectId: DEMO_PROJECTS[0].id,
  };
  persist();
}

// React hook-friendly snapshot
export function useStoreSnapshot(): AppState {
  return state;
}
