import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';

// Every file in src/pages exports `path`, `title` and a default component.
// Adding a page file adds its route, so no shared file needs editing.
const modules = import.meta.glob('./pages/*.jsx', { eager: true });
const pages = Object.values(modules).filter((m) => m.path && m.default);

function NotFound() {
  return (
    <div style={{ padding: 48 }}>
      <h1 style={{ margin: 0 }}>Page not found</h1>
      <p><Link to="/">Back to home</Link></p>
    </div>
  );
}

function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pages.find((p) => p.path === pathname);
    document.title = page ? page.title : 'SmartStock Intelligence';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <TitleSync />
      <Routes>
        <Route element={<AppShell />}>
          {pages.map((p) => <Route key={p.path} path={p.path} element={<p.default />} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
