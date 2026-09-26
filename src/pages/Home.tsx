import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GENRE_PRESETS } from '../data/genres';
import type { GenreId } from '../types';
import { useAppStore } from '../store/useAppStore';
import {
  createProject,
  deleteProject,
  resetToDemos,
  setActiveProject,
} from '../store/projectStore';

export function Home() {
  const { projects } = useAppStore();
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('nacht festival trots');
  const [genreId, setGenreId] = useState<GenreId>('uptempo');
  const [showWizard, setShowWizard] = useState(false);

  const onCreate = () => {
    if (!title.trim()) return;
    const p = createProject({ title: title.trim(), theme, genreId });
    setShowWizard(false);
    setTitle('');
    nav('/songwriter');
    setActiveProject(p.id);
  };

  return (
    <div>
      <h1 className="page-title">Studio Home</h1>
      <p className="page-sub">
        Welkom bij het productiehuis van René Oosting / Platenlabel NyxersMusicProduction.
        Maak originele tracks geïnspireerd door Nederlandse genres — 100% client-side.
      </p>

      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
          + Nieuwe track
        </button>
        <button className="btn btn-secondary" onClick={() => resetToDemos()}>
          Herlaad demo&apos;s
        </button>
      </div>

      {showWizard && (
        <div className="panel">
          <h2>Nieuwe track wizard</h2>
          <div className="field">
            <label>Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. Kind van de nacht" />
          </div>
          <div className="field">
            <label>Thema / sfeer</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="nacht, arena, trots…" />
          </div>
          <div className="field">
            <label>Genre DNA preset</label>
            <select value={genreId} onChange={(e) => setGenreId(e.target.value as GenreId)}>
              {GENRE_PRESETS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.defaultBpm} BPM)
                </option>
              ))}
            </select>
          </div>
          <p className="status">{GENRE_PRESETS.find((g) => g.id === genreId)?.vibe}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onCreate} disabled={!title.trim()}>
              Maak project
            </button>
            <button className="btn btn-secondary" onClick={() => setShowWizard(false)}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Projecten</h2>
      <div className="grid grid-2">
        {projects.map((p) => (
          <div key={p.id} className="card">
            <span className="badge">{GENRE_PRESETS.find((g) => g.id === p.genreId)?.name ?? p.genreId}</span>
            <h3>{p.title}</h3>
            <div className="meta">
              {p.bpm} BPM · {p.key} · {p.durationBars} bars · {p.lyrics.length} lyric-blokken
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{p.notes || p.theme}</p>
            <div className="btn-row">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setActiveProject(p.id);
                  nav('/producer');
                }}
              >
                Open
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setActiveProject(p.id);
                  nav('/export');
                }}
              >
                Export
              </button>
              {!p.id.startsWith('demo-') && (
                <button className="btn btn-danger" onClick={() => deleteProject(p.id)}>
                  Verwijder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h2>Genre DNA presets</h2>
        <div className="grid grid-3">
          {GENRE_PRESETS.map((g) => (
            <div key={g.id} className="card" style={{ padding: '0.85rem' }}>
              <h3 style={{ fontSize: '0.9rem' }}>{g.name}</h3>
              <div className="meta">{g.tagline}</div>
              <div className="meta" style={{ marginBottom: 0 }}>
                {g.bpmMin}–{g.bpmMax} BPM · default {g.defaultBpm}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
