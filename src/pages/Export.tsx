import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  downloadMp3,
  downloadProjectJson,
  downloadWav,
  renderProject,
} from '../audio/exportAudio';
import { playPreview, type PlayHandle } from '../audio/sequencer';
import { useAppStore } from '../store/useAppStore';

const hasEleven = Boolean(import.meta.env.VITE_ELEVENLABS_API_KEY);
const hasMusicApi = Boolean(import.meta.env.VITE_MUSICAPI_KEY);

export function ExportPage() {
  const { activeProjectId, projects } = useAppStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [bars, setBars] = useState(32);
  const handle = useRef<PlayHandle | null>(null);

  if (!project) {
    return (
      <div className="empty">
        Geen actief project. <Link to="/">Kies een track</Link>.
      </div>
    );
  }

  const run = async (fn: () => Promise<void>, label: string) => {
    setBusy(true);
    setStatus(`${label}…`);
    try {
      await fn();
      setStatus(`${label} voltooid.`);
    } catch (e) {
      setStatus(`Fout: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const previewLive = () => {
    handle.current?.stop();
    handle.current = playPreview(project, bars);
  };

  const aiFullTrack = async () => {
    setBusy(true);
    setStatus('AI Full Track…');
    try {
      if (hasEleven) {
        const key = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
        const prompt = `Original Dutch ${project.genreId} instrumental inspired track titled "${project.title}", theme: ${project.theme}, ${project.bpm} BPM. No vocals cloning, no covers.`;
        const res = await fetch('https://api.elevenlabs.io/v1/music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': key,
          },
          body: JSON.stringify({ prompt, duration_seconds: Math.min(120, bars * 4 * (60 / project.bpm)) }),
        });
        if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}-ai.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('AI track gedownload (ElevenLabs).');
      } else if (hasMusicApi) {
        setStatus('MusicAPI key gevonden — configureer endpoint in .env indien nodig. Fallback: lokale synth.');
        await downloadMp3(project, bars);
      }
    } catch (e) {
      setStatus(`AI fout (fallback naar lokale engine): ${e instanceof Error ? e.message : String(e)}`);
      try {
        await downloadMp3(project, bars);
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Export</h1>
      <p className="page-sub">
        Genereer preview, download WAV + MP3, of project JSON blueprint. Alles in de browser.
      </p>

      <div className="panel">
        <h2>{project.title}</h2>
        <p className="meta">
          {project.bpm} BPM · {project.key} · {project.durationBars} bars totaal · master LUFS {project.master.lufsTarget}
        </p>
        <div className="field">
          <label>Export / preview lengte (bars)</label>
          <input
            type="range"
            min={8}
            max={Math.max(8, project.durationBars)}
            step={4}
            value={Math.min(bars, project.durationBars)}
            onChange={(e) => setBars(Number(e.target.value))}
          />
          <span className="status">
            {bars} bars ≈ {((bars * 4 * 60) / project.bpm).toFixed(1)} seconden
          </span>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy} onClick={previewLive}>
            ▶ Live preview
          </button>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await renderProject(project, { maxBars: bars });
              }, 'Offline render test')
            }
          >
            Test OfflineAudioContext
          </button>
          <button className="btn btn-secondary" onClick={() => handle.current?.stop()}>
            ■ Stop
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Downloads</h2>
        <div className="btn-row">
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => run(() => downloadWav(project, bars), 'WAV export')}
          >
            Download WAV
          </button>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => run(() => downloadMp3(project, bars), 'MP3 export')}
          >
            Download MP3
          </button>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => {
              downloadProjectJson(project);
              setStatus('Project JSON gedownload.');
            }}
          >
            Download project JSON
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>AI Full Track (optioneel)</h2>
        {hasEleven || hasMusicApi ? (
          <>
            <p className="status">
              API key gedetecteerd ({hasEleven ? 'ElevenLabs' : ''}
              {hasEleven && hasMusicApi ? ' + ' : ''}
              {hasMusicApi ? 'MusicAPI' : ''}).
            </p>
            <button className="btn btn-primary" disabled={busy} onClick={() => void aiFullTrack()}>
              AI Full Track
            </button>
          </>
        ) : (
          <p className="status">
            Geen API key. Voeg <code>VITE_ELEVENLABS_API_KEY</code> of <code>VITE_MUSICAPI_KEY</code> toe
            in <code>.env</code> om AI Full Track te activeren. De lokale synth-engine werkt zonder keys.
          </p>
        )}
      </div>

      {status && (
        <p className={`status ${status.startsWith('Fout') || status.includes('fout') ? 'err' : 'ok'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
