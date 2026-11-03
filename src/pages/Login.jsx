import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/login';
export const title = 'Sign in · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Login() {
  useVoicePage('login');
  return null;
}
