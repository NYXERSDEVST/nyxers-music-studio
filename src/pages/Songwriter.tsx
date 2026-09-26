import { useAppStore } from '../store/useAppStore';
import { updateActive } from '../store/projectStore';
import { generateLyrics, SECTION_LABELS } from '../data/lyricsEngine';
import { Link } from 'react-router-dom';

export function Songwriter() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Maak of open een track</Link>.
      </div>
    );
  }

  const regen = () => {
    updateActive({
      lyrics: generateLyrics(project.title, project.theme, project.genreId),
    });
  };

  return (
    <div>
      <h1 className="page-title">Songwriter</h1>
      <p className="page-sub">
        Originele NL-teksten via templates + procedurele rijm-engine. Geen covers, geen gekopieerde hits.
      </p>

      <div className="panel">
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label>Titel</label>
            <input
              value={project.title}
              onChange={(e) => updateActive({ title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Thema</label>
            <input
              value={project.theme}
              onChange={(e) => updateActive({ theme: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Taal</label>
          <input value="Nederlands (nl-NL)" disabled />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={regen}>
            Genereer originele lyrics
          </button>
        </div>
      </div>

      {project.lyrics.map((block, i) => (
        <div key={`${block.section}-${i}`} className="lyric-block">
          <h4>{SECTION_LABELS[block.section] ?? block.section}</h4>
          {block.lines.map((line, j) => (
            <p key={j}>
              <input
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid transparent',
                  padding: '0.2rem 0',
                }}
                value={line}
                onChange={(e) => {
                  const lyrics = project.lyrics.map((b, bi) =>
                    bi === i
                      ? { ...b, lines: b.lines.map((l, li) => (li === j ? e.target.value : l)) }
                      : b,
                  );
                  updateActive({ lyrics });
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor = 'var(--neon)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              />
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
