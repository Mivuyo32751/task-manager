export type DailyListening = {
  day: string;
  seconds: number;
  tracks: Record<string, { artist: string; seconds: number }>;
};

export type ListeningHistory = DailyListening[];

const updatedEvent = 'groovy-listening-history-updated';

function storageKey() {
  if (typeof window === 'undefined') return 'groovy-listening:guest';
  const email = window.localStorage.getItem('groovy-demo-session')?.trim().toLowerCase();
  return `groovy-listening:${email || 'guest'}`;
}

export function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readListeningHistory(): ListeningHistory {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey()) || '[]') as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is DailyListening => Boolean(entry && typeof entry === 'object' && typeof entry.day === 'string' && typeof entry.seconds === 'number' && entry.tracks && typeof entry.tracks === 'object'));
  } catch {
    return [];
  }
}

export function addListeningTime(title: string, artist: string, seconds: number) {
  if (typeof window === 'undefined' || !Number.isFinite(seconds) || seconds <= 0 || seconds > 3) return;
  const history = readListeningHistory();
  const today = localDay();
  const entry = history.find((item) => item.day === today) ?? { day: today, seconds: 0, tracks: {} };
  const track = entry.tracks[title] ?? { artist, seconds: 0 };
  track.seconds += seconds;
  track.artist = artist;
  entry.tracks[title] = track;
  entry.seconds += seconds;
  const next = [...history.filter((item) => item.day !== today && item.day >= localDay(new Date(Date.now() - 30 * 86400000))), entry];
  window.localStorage.setItem(storageKey(), JSON.stringify(next));
  window.dispatchEvent(new Event(updatedEvent));
}

export function subscribeToListeningHistory(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(updatedEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(updatedEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}
