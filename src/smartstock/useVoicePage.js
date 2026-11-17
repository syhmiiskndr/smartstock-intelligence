import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mountVoiceApp } from './engine';

// Scene name -> route. A page file for each route lives in src/pages (Home.jsx, Stock.jsx, ...).
export const VOICE_ROUTES = {
  home: '/',
  stock: '/stock',
  cost: '/cost',
  fresh: '/fresh',
  ops: '/approvals',
  people: '/people',
  rules: '/rules',
  login: '/login',
};

// The voice UI is built once and shared by every page, so the dock, Dynamic Island
// and animations keep running while you move between pages.
let app = null;
let mounted = 0;
let navigateTo = () => {};

export function useVoicePage(scene) {
  const navigate = useNavigate();
  useEffect(() => {
    navigateTo = (s, replace) => navigate(VOICE_ROUTES[s] || '/voice', { replace: !!replace });
    mounted += 1;
    if (!app) {
      try {
        app = mountVoiceApp(document.body, { scene, onNavigate: (s, replace) => navigateTo(s, replace) });
      } catch (err) {
        document.getElementById('ss-root')?.remove(); // do not leave a half-built UI behind
        throw err;
      }
    } else app.show(scene);
    return () => {
      mounted -= 1;
      // Leave it alive when the next page mounts straight away, remove it when you leave these pages.
      setTimeout(() => {
        if (mounted === 0 && app) {
          app.destroy();
          app = null;
        }
      }, 0);
    };
  }, [scene, navigate]);
}
