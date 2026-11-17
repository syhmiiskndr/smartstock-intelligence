import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/login/staff';
export const title = 'Staff sign in · SmartStock';

// Staff sign-in form. The page itself is drawn by the shared voice engine.
export default function LoginStaff() {
  useVoicePage('login-staff');
  return null;
}
