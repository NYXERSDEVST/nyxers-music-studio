import { useState } from 'react';
import { downloadAlbumZip } from '../audio/exportAudio';
import { useAppStore } from '../store/useAppStore';
import { upsertAlbum } from '../store/projectStore';
import type { Album } from '../types';

export function AlbumBuilder() {
  const { albums, projects } = useAppStore();
  const album = albums[0] ?? null;
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  if (!album) {
    return <div className="empty">Geen album. Herlaad demo&apos;s vanaf Studio Home.</div>;
  }

  const set = (patch: Partial<Album>) => upsertAlbum({ ...album, ...patch });

  const move = (id: string, dir: -1 | 1) => {
    const ids = [...album.trackIds];
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    set({ trackIds: ids });
  };

  const toggleTrack = (id: string) => {
    if (album.trackIds.includes(id)) {
      set({ trackIds: album.trackIds.filter((t) => t !== id) });
    } else {
      set({ trackIds: [...album.trackIds, id] });
    }
  };

  const exportZip = async () => {
    setBusy(true);
    setStatus('Album renderen & ZIP maken…');
    try {
      await downloadAlbumZip(album, projects);
      setStatus('ZIP gedownload.');
    } catch (e) {
      setStatus(`Fout: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Album Builder</h1>
      <p className="page-sub">Multi-track album, volgorde, cover metadata, export ZIP van MP3s.</p>

      <div className="panel">
        <div className="field">
          <label>Albumtitel</label>
          <input value={album.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="field">
          <label>Artiest / label</label>
          <input value={album.artist} onChange={(e) => set({ artist: e.target.value })} />
        </div>
        <div className="field">
          <label>Jaar</label>
          <input
            type="number"
            value={album.year}
            onChange={(e) => set({ year: Number(e.target.value) || album.year })}
          />
        </div>
        <div className="field">
          <label>Cover notitie</label>
          <textarea value={album.coverNote} onChange={(e) => set({ coverNote: e.target.value })} />
        </div>
      </div>

      <div className="panel">
        <h2>Tracklist</h2>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Titel</th>
              <th>BPM</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {album.trackIds.map((id, i) => {
              const p = projects.find((x) => x.id === id);
              if (!p) return null;
              return (
                <tr key={id}>
                  <td>{i + 1}</td>
                  <td>{p.title}</td>
                  <td>{p.bpm}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => move(id, -1)}>
                      ↑
                    </button>{' '}
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => move(id, 1)}>
                      ↓
                    </button>{' '}
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => toggleTrack(id)}>
                      −
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 style={{ marginTop: '1.25rem' }}>Beschikbare tracks toevoegen</h2>
        <div className="btn-row">
          {projects
            .filter((p) => !album.trackIds.includes(p.id))
            .map((p) => (
              <button key={p.id} className="btn btn-secondary" onClick={() => toggleTrack(p.id)}>
                + {p.title}
              </button>
            ))}
          {projects.every((p) => album.trackIds.includes(p.id)) && (
            <span className="status">Alle projecten staan al op het album.</span>
          )}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={busy || album.trackIds.length === 0} onClick={exportZip}>
          Download album ZIP (MP3)
        </button>
      </div>
      {status && <p className={`status ${status.startsWith('Fout') ? 'err' : 'ok'}`}>{status}</p>}
    </div>
  );
}
