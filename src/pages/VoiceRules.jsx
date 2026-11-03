import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/rules';
export const title = 'SmartStock Voice · Rules';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceRules() {
  useVoicePage('rules');
  return null;
}
