import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/';
export const title = 'SmartStock Intelligence';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Home() {
  useVoicePage('home');
  return null;
}
