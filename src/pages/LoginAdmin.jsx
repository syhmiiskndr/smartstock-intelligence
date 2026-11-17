import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/login/admin';
export const title = 'Admin sign in · SmartStock';

// Admin sign-in form. The page itself is drawn by the shared voice engine.
export default function LoginAdmin() {
  useVoicePage('login-admin');
  return null;
}
