import { Link } from 'react-router-dom';
import { getGenre } from '../data/genres';
import { useAppStore } from '../store/useAppStore';
import { updateActive } from '../store/projectStore';

const EQ_PRESETS = [
  { id: 'gabber-boost', name: 'Gabber boost', desc: '+low punch, lichte mid scoop, air op hats' },
  { id: 'uptempo-mid', name: 'Uptempo mid-forward', desc: 'Raspy mids, controlled sub, scherpe top' },
  { id: 'industrial-dark', name: 'Industrial dark', desc: 'Donkere low-mids, metallische highs' },
  { id: 'happy-bright', name: 'Happy bright', desc: 'Heldere highs, warme low-end' },
  { id: 'nederhop-warm', name: 'Nederhop warm', desc: 'Sub-focus, zachte highs, vocal space' },
  { id: 'piraten-bright', name: 'Piraten bright', desc: 'Accordion/orgel presence, feast-ready' },
  { id: 'ballad-warm', name: 'Ballad warm', desc: 'Zachte compressie-curve, emotionele mids' },
  { id: 'metal-punch', name: 'Metal punch', desc: 'Strakke kick/snare, gitaar presence' },
  { id: 'hardstyle-reverse', name: 'Hardstyle reverse', desc: 'Diepe reverse-bass, wide tops' },
  { id: 'hybrid-punch', name: 'Hybrid punch', desc: 'Switch half-time / 4/4 balance' },
];

export function Mastering() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Kies een track</Link>.
      </div>
    );
  }

  const m = project.master;
  const set = (patch: Partial<typeof m>) => updateActive({ master: { ...m, ...patch } });

  return (
    <div>
      <h1 className="page-title">Mastering</h1>
      <p className="page-sub">
        LUFS-doel, limiter, EQ-presets per genre, sidechain-feel. Wordt toegepast bij export.
      </p>

      <div className="panel">
        <h2>Ketens</h2>
        <div className="slider-row">
          <span>LUFS target</span>
          <input
            type="range"
            min={-16}
            max={-6}
            step={0.5}
            value={m.lufsTarget}
            onChange={(e) => set({ lufsTarget: Number(e.target.value) })}
          />
          <span>{m.lufsTarget}</span>
        </div>
        <div className="slider-row">
          <span>Limiter ceiling</span>
          <input
            type="range"
            min={-1.5}
            max={-0.1}
            step={0.05}
            value={m.limiterCeiling}
            onChange={(e) => set({ limiterCeiling: Number(e.target.value) })}
          />
          <span>{m.limiterCeiling}</span>
        </div>
        <div className="slider-row">
          <span>Saturation</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={m.saturation}
            onChange={(e) => set({ saturation: Number(e.target.value) })}
          />
          <span>{m.saturation.toFixed(2)}</span>
        </div>
        <div className="slider-row">
          <span>Stereo width</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={m.stereoWidth}
            onChange={(e) => set({ stereoWidth: Number(e.target.value) })}
          />
          <span>{m.stereoWidth.toFixed(2)}</span>
        </div>
      </div>

      <div className="panel">
        <h2>EQ preset</h2>
        <div className="field">
          <label>Preset</label>
          <select value={m.eqPreset} onChange={(e) => set({ eqPreset: e.target.value })}>
            {EQ_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <p className="status">
          {EQ_PRESETS.find((p) => p.id === m.eqPreset)?.desc ?? 'Custom'}
        </p>
      </div>

      <div className="panel">
        <h2>Sidechain feel</h2>
        <div className="field">
          <label>Beschrijving</label>
          <textarea
            value={m.sidechainFeel}
            onChange={(e) => set({ sidechainFeel: e.target.value })}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => set({ ...getGenre(project.genreId).master })}
        >
          Reset naar genre default
        </button>
      </div>
    </div>
  );
}
