import { useEffect } from 'react';
import { S, signOut } from '../store/store';

export const path = '/login';
export const title = 'Sign in · SmartStock';

// The lock screen itself is drawn by AppShell whenever nobody is signed in.
export default function Login() {
  useEffect(() => { if (S.user) signOut(); }, []);
  return null;
}
