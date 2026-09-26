import type { GenreId, LyricBlock, SongSection } from '../types';

const RHYME_BANKS: Record<string, string[]> = {
  acht: ['nacht', 'kracht', 'wacht', 'pracht', 'slacht', 'bracht'],
  and: ['land', 'hand', 'strand', 'brand', 'verstand', 'rand'],
  eer: ['meer', 'weer', 'keer', 'sfeer', 'geweer', 'verkeer'],
  ocht: ['ocht', 'kocht', 'vocht', 'docht', 'zocht'],
  ijn: ['zijn', 'mijn', 'pijn', 'lijn', 'wijn', 'fijn'],
  ood: ['lood', 'dood', 'brood', 'rood', 'nood', 'lood'],
  ur: ['vuur', 'muur', 'puur', 'duur', 'natuur'],
  om: ['drom', 'stom', 'krom', 'om', 'brom'],
  eid: ['tijd', 'strijd', 'vrijheid', 'blijheid', 'wijsheid'],
  ald: ['stad', 'plat', 'nat', 'zat', 'pad'],
};

const THEMES: Record<string, string[]> = {
  nacht: ['de nacht is van ons', 'neon in de straat', 'tot de ochtend brandt', 'schaduwen dansen'],
  stad: ['Rotterdam klopt', 'haven in mijn bloed', 'beton en trots', 'skyline brandt'],
  feest: ['handen omhoog', 'de vloer beweegt', 'iedereen zingt mee', 'tot de zon opkomt'],
  trots: ['dit is ons land', 'wij staan rechtop', 'geen stap terug', 'hart van staal'],
  liefde: ['jij blijft in mijn hoofd', 'woorden die blijven', 'een belofte in stilte', 'handen die zoeken'],
  straat: ['asfalt onder schoenen', 'verhalen op de muur', 'nooit verkopen', 'eigen pad lopen'],
  arena: ['de arena schreeuwt', 'bass in je botten', 'kick als een storm', 'wij gaan erin'],
  emotie: ['tranen die niet liegen', 'herinnering blijft', 'een laatste dans', 'woorden zonder filter'],
};

const HOOKS: Record<GenreId, string[]> = {
  'classic-gabber': ['HARDCORE IN MIJN BLOED', 'ROTTERDAM STAAT OP', 'KICK TOT DE MUUR'],
  uptempo: ['UPTEMPO TOT HET EINDE', 'ROLL DE KICK NOG HARDER', 'ARENA IS VAN ONS'],
  industrial: ['MACHINE HART', 'BETON EN STAAL', 'WAREHOUSE NACHT'],
  'happy-hardcore': ['DANS TOT DE ZON', 'LACH EN SPRING', 'HAPPY IN MIJN HART'],
  nederhop: ['STRAAT FLOW', 'NOOIT STOPPEN', 'EIGEN STEM'],
  piratenhits: ['CAMPING FEET', 'BIER IN DE LUCHT', 'ZING HET MEE'],
  nederpop: ['JIJ EN IK', 'BLIJF BIJ MIJ', 'WOORDEN VOOR JOU'],
  metal: ['VUUR EN STAAL', 'WIJ BREKEN NIET', 'RIFF IN HET BLOED'],
  hardstyle: ['FESTIVAL HART', 'REVERSE IN DE NACHT', 'SAMEN TOT HET EINDE'],
  'gabber-nederhop': ['HARDCORE × STRAAT', 'TWEE WERELDEN', 'HYBRID TROTS'],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function rhymeWord(seed: number): { end: string; word: string } {
  const keys = Object.keys(RHYME_BANKS);
  const end = pick(keys, seed);
  const word = pick(RHYME_BANKS[end], seed * 7 + 3);
  return { end, word };
}

function themeLine(theme: string, seed: number): string {
  const key = Object.keys(THEMES).find((k) => theme.toLowerCase().includes(k)) ?? 'nacht';
  return pick(THEMES[key], seed);
}

function makeCouplet(theme: string, seed: number, count: number): string[] {
  const lines: string[] = [];
  const r1 = rhymeWord(seed);
  const r2 = rhymeWord(seed + 11);
  for (let i = 0; i < count; i++) {
    const base = themeLine(theme, seed + i * 13);
    const rh = i % 2 === 0 ? r1.word : r2.word;
    const fillers = [
      `${base}, tot aan de ${rh}`,
      `Ik voel de ${rh} in elke stap`,
      `${base} — pure ${rh}`,
      `Door de ${rh} gaan we verder`,
      `Met ${rh} in ons hoofd`,
    ];
    lines.push(pick(fillers, seed + i * 17));
  }
  return lines;
}

export function generateLyrics(
  title: string,
  theme: string,
  genreId: GenreId,
): LyricBlock[] {
  const seed = hash(title + theme + genreId);
  const hook = pick(HOOKS[genreId], seed);

  const sections: { section: SongSection; count: number }[] = [
    { section: 'intro', count: 2 },
    { section: 'verse', count: 4 },
    { section: 'pre', count: 2 },
    { section: 'chorus', count: 4 },
    { section: 'verse', count: 4 },
    { section: 'chorus', count: 4 },
    { section: 'bridge', count: 2 },
    { section: 'drop', count: 2 },
    { section: 'outro', count: 2 },
  ];

  return sections.map((s, idx) => {
    let lines: string[];
    if (s.section === 'chorus' || s.section === 'drop') {
      lines = [hook, themeLine(theme, seed + idx), hook, `${title} — ${pick(RHYME_BANKS.acht, seed + idx)}`];
    } else if (s.section === 'intro') {
      lines = [`(${title})`, themeLine(theme, seed)];
    } else if (s.section === 'outro') {
      lines = [hook, `Einde van de ${pick(RHYME_BANKS.acht, seed)}…`];
    } else {
      lines = makeCouplet(theme || title, seed + idx * 31, s.count);
    }
    return { section: s.section, lines: lines.slice(0, s.count) };
  });
}

export const SECTION_LABELS: Record<SongSection, string> = {
  intro: 'Intro',
  verse: 'Couplet',
  pre: 'Pre-chorus',
  chorus: 'Refrein',
  bridge: 'Bridge',
  drop: 'Drop',
  outro: 'Outro',
  build: 'Build-up',
};
