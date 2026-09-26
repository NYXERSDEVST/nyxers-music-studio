import { Link } from 'react-router-dom';
import { playPreview } from '../audio/sequencer';
import { toneGroovePreview, toneKickHit } from '../audio/tonePreview';
import { useAppStore } from '../store/useAppStore';
import { updateActive } from '../store/projectStore';
import type { KickParams, RollPattern } from '../types';

const SLIDERS: { key: keyof KickParams; label: string; min: number; max: number; step: number }[] = [
  { key: 'attack', label: 'Attack', min: 0.0002, max: 0.02, step: 0.0001 },
  { key: 'pitchStart', label: 'Pitch start (Hz)', min: 60, max: 300, step: 1 },
  { key: 'pitchEnd', label: 'Pitch end (Hz)', min: 25, max: 80, step: 1 },
  { key: 'decay', label: 'Decay', min: 0.08, max: 0.5, step: 0.01 },
  { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.01 },
  { key: 'subLevel', label: 'Sub', min: 0, max: 1, step: 0.01 },
  { key: 'bitcrush', label: 'Bitcrush / raspy', min: 0, max: 1, step: 0.01 },
  { key: 'click', label: 'Click / transient', min: 0, max: 1, step: 0.01 },
];

export function KickLab() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Kies een track</Link>.
      </div>
    );
  }

  const setKick = (key: keyof KickParams, value: number) => {
    updateActive({ kick: { ...project.kick, [key]: value } });
  };

  const applyRollToDrops = (pattern: RollPattern) => {
    const arrangement = project.arrangement.map((b) => {
      if (b.kickPattern === 'roll' || b.section === 'build') {
        const kickPattern = pattern === 'drop' ? 'drop' as const : 'roll' as const;
        return { ...b, rollPattern: pattern, kickPattern };
      }
      return b;
    });
    updateActive({ arrangement });
  };

  return (
    <div>
      <h1 className="page-title">Kick Lab</h1>
      <p className="page-sub">
        Distorted sine pitch-drop kick (gabber-formule), rolls (1/8→1/16→1/32), drops & uptempo raspy character.
      </p>

      <div className="panel">
        <h2>Kick parameters</h2>
        {SLIDERS.map((s) => (
          <div className="slider-row" key={s.key}>
            <span>{s.label}</span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={project.kick[s.key]}
              onChange={(e) => setKick(s.key, Number(e.target.value))}
            />
            <span>{Number(project.kick[s.key]).toFixed(s.step < 0.01 ? 4 : 2)}</span>
          </div>
        ))}
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => void toneKickHit(project.kick)}>
            ▶ Preview kick
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => void toneGroovePreview(project, 8)}
          >
            ▶ Kick in groove (Tone · 8 bars)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => playPreview(project, 8)}
          >
            ▶ Sequencer preview (8 bars)
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Roll / drop patterns</h2>
        <div className="btn-row">
          {(
            [
              ['accel', 'Accel roll (1/8→1/16→1/32)'],
              ['build', 'Build roll'],
              ['stutter', 'Stutter'],
              ['drop', 'Kick drop (silence → impact)'],
              ['none', 'Geen roll'],
            ] as [RollPattern, string][]
          ).map(([p, label]) => (
            <button key={p} className="btn btn-secondary" onClick={() => applyRollToDrops(p)}>
              {label}
            </button>
          ))}
        </div>
        <p className="status" style={{ marginTop: '0.75rem' }}>
          Tip: Uptempo raspy = hoge distortion + bitcrush. Classic gabber = mid pitch-drop + warme sub.
        </p>
      </div>
    </div>
  );
}
