import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/login';
export const title = 'SmartStock Voice · Sign in';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceLogin() {
  useVoicePage('login');
  return null;
}
