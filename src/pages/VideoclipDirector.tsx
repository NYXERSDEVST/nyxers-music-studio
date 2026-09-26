import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Shot } from '../types';
import { getGenre } from '../data/genres';

function buildShots(title: string, theme: string, genreName: string): Shot[] {
  return [
    {
      id: '1',
      timing: '0:00–0:15 Intro',
      shotType: 'Wide establishing',
      description: `Nachtelijke Nederlandse stad / haven, neon reflecties, titel "${title}" als subtiele typografie.`,
      aiPrompt: `Cinematic night shot of Dutch industrial harbor, neon magenta and cyan lights reflecting on wet asphalt, dark festival mood, no logos, atmospheric fog, 35mm, ${theme}`,
    },
    {
      id: '2',
      timing: '0:15–0:35 Verse',
      shotType: 'Tracking / handheld',
      description: 'Artiest/silhouette loopt door straat of backstage corridor, energie opbouwend.',
      aiPrompt: `Silhouette of performer walking through neon-lit corridor backstage, dutch hardcore festival atmosphere, moody lighting, ${genreName} energy, no celebrity likeness`,
    },
    {
      id: '3',
      timing: 'Build',
      shotType: 'Rapid cuts',
      description: 'Kickroll visuals: stroboscope, crowd hands, close-up kickdrum membrane abstract.',
      aiPrompt: `Abstract visualization of accelerating kick drums, strobe lights, crowd hands in the air, black and neon aesthetic, festival hardcore stage, high contrast`,
    },
    {
      id: '4',
      timing: 'Drop',
      shotType: 'Hero wide + pyro',
      description: 'Full stage blast, LED wall abstract art, confetti/CO2, geen merknamen.',
      aiPrompt: `Arena hardcore festival mainstage drop moment, massive LED wall abstract neon visuals, CO2 jets, crowd jumping, cinematic wide shot, no trademarks`,
    },
    {
      id: '5',
      timing: 'Bridge / emotie',
      shotType: 'Close-up',
      description: 'Gezicht/handen/details — emotie passend bij thema.',
      aiPrompt: `Intimate close-up cinematic portrait under purple neon, emotional dutch nightlife mood, shallow depth of field, ${theme}, original character not a known person`,
    },
    {
      id: '6',
      timing: 'Outro',
      shotType: 'Pull-out drone',
      description: 'Camera trekt weg boven de arena / stad tot zwart.',
      aiPrompt: `Drone pull-out over neon lit festival arena at night fading to black, epic dutch nightlife, cinematic, ${title}`,
    },
  ];
}

export function VideoclipDirector() {
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
  const shots = buildShots(project.title, project.theme, genre.name);

  const copyAll = () => {
    const text = shots.map((s) => `[${s.timing}] ${s.shotType}\n${s.description}\nPROMPT: ${s.aiPrompt}`).join('\n\n');
    void navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <h1 className="page-title">Videoclip Director</h1>
      <p className="page-sub">
        Shotlist + prompt pack voor AI-videotools. Originele scenes — geen celebrity clones.
      </p>

      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={copyAll}>
          Kopieer alle prompts
        </button>
      </div>

      <div className="grid">
        {shots.map((s) => (
          <div key={s.id} className="card shot-card">
            <span className="badge">{s.timing}</span>
            <span className="badge">{s.shotType}</span>
            <h3 style={{ marginTop: '0.5rem' }}>Shot {s.id}</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{s.description}</p>
            <div className="field">
              <label>AI prompt</label>
              <textarea readOnly value={s.aiPrompt} rows={3} />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => void navigator.clipboard.writeText(s.aiPrompt)}
            >
              Kopieer prompt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
