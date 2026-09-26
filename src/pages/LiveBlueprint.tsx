import { Link } from 'react-router-dom';
import { getGenre } from '../data/genres';
import { useAppStore } from '../store/useAppStore';
import type { FestivalCue } from '../types';

export function LiveBlueprint() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Kies een track</Link>.
      </div>
    );
  }

  const genre = getGenre(project.genreId);
  let bar = 0;
  const cues: FestivalCue[] = [];
  for (const block of project.arrangement) {
    if (block.section === 'drop') {
      cues.push({
        timeBar: bar,
        label: 'DROP',
        note: `Vol energie · kick ${block.kickPattern} · lights strobe + confetti cue`,
      });
    } else if (block.section === 'build') {
      cues.push({
        timeBar: bar,
        label: 'BUILD',
        note: `Riser + kickroll · crowd hands · spot op MC`,
      });
    } else if (block.section === 'intro') {
      cues.push({
        timeBar: bar,
        label: 'INTRO',
        note: `Walk-on · logo wall · sfeerlicht neon magenta/paars`,
      });
    } else if (block.rollPattern === 'drop' || block.kickPattern === 'drop') {
      cues.push({
        timeBar: bar,
        label: 'KICK DROP',
        note: `Stilte → impact · blackout dan full blast`,
      });
    }
    bar += block.bars;
  }

  const setlist = projects.slice(0, 5).map((p, i) => ({
    pos: i + 1,
    title: p.title,
    bpm: p.bpm,
    vibe: getGenre(p.genreId).tagline,
  }));

  return (
    <div>
      <h1 className="page-title">Live / Festival Blueprint</h1>
      <p className="page-sub">
        Setlist, drop cues & arena hardcore festival stage notes — geen merknamen misbruiken.
      </p>

      <div className="panel">
        <h2>Stage concept</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>{project.title}</strong> · {genre.vibe}
        </p>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          <li>Arena hardcore festival vibe: zwart podium, neon magenta/cyan lasers, LED wall met abstracte kick-visuals</li>
          <li>MC cue links van DJ-booth; pyro alleen op gemarkeerde DROP-bars</li>
          <li>Crowd-flow: build = hands up, drop = mosh/jump, bridge = vocal chant</li>
          <li>FOH: kick dominant in subs, screech gecontroleerd in tops, vocal chops mid</li>
        </ul>
      </div>

      <div className="panel">
        <h2>Drop / cue sheet — {project.title}</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Bar</th>
              <th>Cue</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {cues.map((c, i) => (
              <tr key={i}>
                <td>{c.timeBar}</td>
                <td>
                  <span className="badge">{c.label}</span>
                </td>
                <td>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Voorbeeld setlist (uit projecten)</h2>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Track</th>
              <th>BPM</th>
              <th>Sfeer</th>
            </tr>
          </thead>
          <tbody>
            {setlist.map((s) => (
              <tr key={s.pos}>
                <td>{s.pos}</td>
                <td>{s.title}</td>
                <td>{s.bpm}</td>
                <td>{s.vibe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
