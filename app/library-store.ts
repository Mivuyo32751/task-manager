import { tracks } from './music-data';

export type LibraryState = {
  likedTracks: string[];
  savedPlaylists: string[];
};

const changedEvent = 'groovy-library-updated';

function storageKey() {
  if (typeof window === 'undefined') return 'groovy-library:guest';
  const email = window.localStorage.getItem('groovy-demo-session')?.trim().toLowerCase();
  return `groovy-library:${email || 'guest'}`;
}

export function readLibrary(): LibraryState {
  if (typeof window === 'undefined') return { likedTracks: [], savedPlaylists: [] };
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey()) || '{}') as Partial<LibraryState>;
    return {
      likedTracks: Array.isArray(saved.likedTracks) ? saved.likedTracks.filter((title): title is string => typeof title === 'string') : [],
      savedPlaylists: Array.isArray(saved.savedPlaylists) ? saved.savedPlaylists.filter((title): title is string => typeof title === 'string') : [],
    };
  } catch {
    return { likedTracks: [], savedPlaylists: [] };
  }
}

function writeLibrary(state: LibraryState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(), JSON.stringify(state));
  window.dispatchEvent(new Event(changedEvent));
}

function toggleItem(key: keyof LibraryState, title: string) {
  const state = readLibrary();
  const values = state[key];
  writeLibrary({ ...state, [key]: values.includes(title) ? values.filter((item) => item !== title) : [...values, title] });
}

export function toggleLikedTrack(title: string) {
  toggleItem('likedTracks', title);
}

export function toggleSavedPlaylist(title: string) {
  toggleItem('savedPlaylists', title);
}

export function subscribeToLibrary(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(changedEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(changedEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function findTrackIndex(title: string) {
  return tracks.findIndex((track) => track.title === title);
}
