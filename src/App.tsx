import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Songwriter } from './pages/Songwriter';
import { Producer } from './pages/Producer';
import { KickLab } from './pages/KickLab';
import { Mastering } from './pages/Mastering';
import { AlbumBuilder } from './pages/AlbumBuilder';
import { LiveBlueprint } from './pages/LiveBlueprint';
import { VideoclipDirector } from './pages/VideoclipDirector';
import { ExportPage } from './pages/Export';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="songwriter" element={<Songwriter />} />
          <Route path="producer" element={<Producer />} />
          <Route path="kick-lab" element={<KickLab />} />
          <Route path="mastering" element={<Mastering />} />
          <Route path="album" element={<AlbumBuilder />} />
          <Route path="live" element={<LiveBlueprint />} />
          <Route path="videoclip" element={<VideoclipDirector />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
