import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GENRE_PRESETS, getGenre } from '../data/genres';
import { playPreview, type PlayHandle } from '../audio/sequencer';
import { useAppStore } from '../store/useAppStore';
import { updateActive } from '../store/projectStore';
import type { GenreId } from '../types';
import { SECTION_LABELS } from '../data/lyricsEngine';

export function Producer() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const handle = useRef<PlayHandle | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Kies een track</Link>.
      </div>
    );
  }

  const stop = () => {
    handle.current?.stop();
    handle.current = null;
    setPlaying(false);
  };

  const play = (bars = 16) => {
    stop();
    handle.current = playPreview(project, bars);
    setPlaying(true);
    const ms = (bars * 4 * 60 * 1000) / project.bpm + 500;
    setTimeout(() => setPlaying(false), ms);
  };

  const applyGenre = (id: GenreId) => {
    const g = getGenre(id);
    updateActive({
      genreId: id,
      bpm: g.defaultBpm,
      key: g.defaultKey,
      arrangement: g.arrangementBlueprint.map((b) => ({ ...b })),
      kick: { ...g.kick },
      energyCurve: g.arrangementBlueprint.map((b) => b.energy),
      master: { ...g.master },
      durationBars: g.arrangementBlueprint.reduce((s, b) => s + b.bars, 0),
    });
  };

  const lanes = getGenre(project.genreId).instruments;

  return (
    <div>
      <h1 className="page-title">Producer</h1>
      <p className="page-sub">Arrangement timeline, BPM, key, energy curve & instrument lanes.</p>

      <div className="panel">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
          <div className="field">
            <label>BPM</label>
            <input
              type="number"
              min={60}
              max={250}
              value={project.bpm}
              onChange={(e) => updateActive({ bpm: Number(e.target.value) || project.bpm })}
            />
          </div>
          <div className="field">
            <label>Toonsoort</label>
            <select value={project.key} onChange={(e) => updateActive({ key: e.target.value })}>
              {['A minor', 'E minor', 'D minor', 'G minor', 'C major', 'F# minor', 'B minor'].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Genre preset</label>
            <select
              value={project.genreId}
              onChange={(e) => applyGenre(e.target.value as GenreId)}
            >
              {GENRE_PRESETS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="status">{getGenre(project.genreId).vibe}</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => play(16)} disabled={playing}>
            ▶ Preview 16 bars
          </button>
          <button className="btn btn-secondary" onClick={() => play(32)} disabled={playing}>
            ▶ Preview 32 bars
          </button>
          <button className="btn btn-secondary" onClick={stop}>
            ■ Stop
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Arrangement timeline ({project.durationBars} bars)</h2>
        <div className="timeline">
          {project.arrangement.map((b, i) => (
            <div
              key={i}
              className="timeline-block"
              style={{
                minWidth: Math.max(64, b.bars * 10),
                opacity: 0.55 + b.energy * 0.45,
              }}
            >
              <div>{SECTION_LABELS[b.section] ?? b.section}</div>
              <div className="bars">{b.bars} bars</div>
              <div className="energy-bar">
                <span style={{ width: `${b.energy * 100}%` }} />
              </div>
              <div style={{ marginTop: 4, fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                {b.kickPattern}
                {b.rollPattern && b.rollPattern !== 'none' ? ` · ${b.rollPattern}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Instrument lanes</h2>
        <div className="grid grid-3">
          {lanes.map((lane) => (
            <div key={lane} className="card" style={{ padding: '0.75rem' }}>
              <strong style={{ textTransform: 'capitalize' }}>{lane}</strong>
              <div className="meta" style={{ marginBottom: 0 }}>
                Actief in arrangement volgens genre DNA
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Energy curve</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {project.arrangement.map((b, i) => (
            <div
              key={i}
              title={`${b.section}: ${Math.round(b.energy * 100)}%`}
              style={{
                flex: b.bars,
                height: `${b.energy * 100}%`,
                background: 'linear-gradient(180deg, var(--neon), var(--neon-2))',
                borderRadius: 4,
                minWidth: 12,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
