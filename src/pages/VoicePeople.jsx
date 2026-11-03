import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/people';
export const title = 'SmartStock Voice · People';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoicePeople() {
  useVoicePage('people');
  return null;
}
