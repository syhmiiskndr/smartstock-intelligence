import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/approvals';
export const title = 'Approvals · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Approvals() {
  useVoicePage('ops');
  return null;
}
