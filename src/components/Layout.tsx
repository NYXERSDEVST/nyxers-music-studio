import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const LINKS = [
  { to: '/', label: 'Studio Home', end: true },
  { to: '/songwriter', label: 'Songwriter' },
  { to: '/producer', label: 'Producer' },
  { to: '/kick-lab', label: 'Kick Lab' },
  { to: '/mastering', label: 'Mastering' },
  { to: '/album', label: 'Album Builder' },
  { to: '/live', label: 'Live / Festival' },
  { to: '/videoclip', label: 'Videoclip Director' },
  { to: '/export', label: 'Export' },
];

export function Layout() {
  const { activeProjectId, projects } = useAppStore();
  const active = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Nyxers Music Studio</div>
          <div className="brand-sub">Platenlabel NyxersMusicProduction</div>
        </div>
        <div className="legal-banner">
          Originele generaties · geen voice-clones · geen covers van bestaande tracks
        </div>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        {active && (
          <div className="card" style={{ marginTop: 'auto', padding: '0.75rem' }}>
            <div className="meta">Actief project</div>
            <strong style={{ fontSize: '0.9rem' }}>{active.title}</strong>
            <div className="meta" style={{ marginTop: 4, marginBottom: 0 }}>
              {active.bpm} BPM · {active.key}
            </div>
          </div>
        )}
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
