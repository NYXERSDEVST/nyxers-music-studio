export type GenreId =
  | 'classic-gabber'
  | 'uptempo'
  | 'industrial'
  | 'happy-hardcore'
  | 'nederhop'
  | 'piratenhits'
  | 'nederpop'
  | 'metal'
  | 'hardstyle'
  | 'gabber-nederhop';

export type SongSection =
  | 'intro'
  | 'verse'
  | 'pre'
  | 'chorus'
  | 'bridge'
  | 'drop'
  | 'outro'
  | 'build';

export interface KickParams {
  attack: number;
  pitchStart: number;
  pitchEnd: number;
  decay: number;
  distortion: number;
  subLevel: number;
  bitcrush: number;
  click: number;
}

export type RollPattern = 'none' | 'build' | 'accel' | 'stutter' | 'drop';

export interface ArrangementBlock {
  section: SongSection;
  bars: number;
  energy: number;
  kickPattern: 'four' | 'half' | 'roll' | 'drop' | 'silence';
  rollPattern?: RollPattern;
  hatDense: boolean;
  lead: boolean;
  screech: boolean;
  riser: boolean;
}

export interface LyricBlock {
  section: SongSection;
  lines: string[];
}

export interface MasterSettings {
  lufsTarget: number;
  limiterCeiling: number;
  eqPreset: string;
  sidechainFeel: string;
  saturation: number;
  stereoWidth: number;
}

export interface TrackProject {
  id: string;
  title: string;
  theme: string;
  genreId: GenreId;
  bpm: number;
  key: string;
  createdAt: string;
  updatedAt: string;
  lyrics: LyricBlock[];
  arrangement: ArrangementBlock[];
  kick: KickParams;
  energyCurve: number[];
  master: MasterSettings;
  durationBars: number;
  notes: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverNote: string;
  trackIds: string[];
}

export interface GenrePreset {
  id: GenreId;
  name: string;
  tagline: string;
  bpmMin: number;
  bpmMax: number;
  defaultBpm: number;
  defaultKey: string;
  kick: KickParams;
  arrangementBlueprint: ArrangementBlock[];
  lyricTone: string;
  master: MasterSettings;
  instruments: string[];
  vibe: string;
}

export interface FestivalCue {
  timeBar: number;
  label: string;
  note: string;
}

export interface Shot {
  id: string;
  timing: string;
  shotType: string;
  description: string;
  aiPrompt: string;
}

export interface AppState {
  projects: TrackProject[];
  albums: Album[];
  activeProjectId: string | null;
}
