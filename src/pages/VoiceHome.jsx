import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice';
export const title = 'SmartStock Voice · Home';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceHome() {
  useVoicePage('home');
  return null;
}
