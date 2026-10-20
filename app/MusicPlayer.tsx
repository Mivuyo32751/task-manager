'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { tracks } from './music-data';
import { readLibrary, subscribeToLibrary, toggleLikedTrack, toggleSavedPlaylist } from './library-store';
import { addListeningTime } from './listening-history';

// Original placeholder lines for the demo audio. Replace with licensed, track-matched lyrics for production.
const lyricPreviews = [
  [
    { time: 0, text: 'City lights are waking up' },
    { time: 22, text: 'We find our rhythm in the crowd' },
    { time: 44, text: 'Every road is leading somewhere' },
    { time: 66, text: 'Let the night carry us there' },
    { time: 88, text: 'One more song before we go' },
    { time: 110, text: 'Hold that feeling, take it slow' },
    { time: 132, text: 'When the morning starts to show' },
    { time: 154, text: 'We will keep the afterglow' },
  ],
  [
    { time: 0, text: 'Take a breath and let it land' },
    { time: 22, text: 'Soft rain tracing on the glass' },
    { time: 44, text: 'There is room to understand' },
    { time: 66, text: 'Let the hurry drift and pass' },
    { time: 88, text: 'Quiet colors fill the room' },
    { time: 110, text: 'A little light begins to bloom' },
    { time: 132, text: 'Stay a while inside this tune' },
    { time: 154, text: 'Morning comes, but not too soon' },
  ],
  [
    { time: 0, text: 'Warm air moving through the trees' },
    { time: 22, text: 'Drums are rolling with the breeze' },
    { time: 44, text: 'Follow every little sound' },
    { time: 66, text: 'Feel the good around us now' },
    { time: 88, text: 'Golden hour on the road' },
    { time: 110, text: 'Leave behind a lighter load' },
    { time: 132, text: 'Every voice becomes a song' },
    { time: 154, text: 'Carry that beat as we move along' },
  ],
];

function PlayerIcon({ name }: { name: 'back' | 'more' | 'heart' | 'shuffle' | 'previous' | 'play' | 'pause' | 'next' | 'repeat' }) {
  const shapes = {
    back: <path d="m15 18-6-6 6-6" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    heart: <path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.5 4.5 0 0 1 8.8-1.2 4.5 4.5 0 0 1 8.8 1.2Z" />,
    shuffle: <><path d="m18 14 3 3-3 3M3 7h2c5 0 7 10 12 10h4M18 4l3 3-3 3M3 17h2c1.5 0 2.7-1.2 3.8-2.8M14.2 9.8C15 8.2 16 7 17 7h4" /></>,
    previous: <><path d="M19 5v14L9 12z" fill="currentColor" stroke="none" /><path d="M5 5v14" /></>,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    next: <><path d="M5 5v14l10-7z" fill="currentColor" stroke="none" /><path d="M19 5v14" /></>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastLoggedPosition = useRef(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const [savedMix, setSavedMix] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mode, setMode] = useState<'Song' | 'Video'>('Song');
  const track = tracks[trackIndex];
  const lyrics = lyricPreviews[trackIndex];
  const activeLyricIndex = lyrics.reduce((activeIndex, line, index) => line.time <= progress ? index : activeIndex, 0);

  useEffect(() => {
    const refresh = () => {
      const library = readLibrary();
      setLiked(library.likedTracks.includes(track.title));
      setSavedMix(library.savedPlaylists.includes(track.title));
    };
    refresh();
    return subscribeToLibrary(refresh);
  }, [track.title]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTrack = Number(params.get('track'));
    if (!params.has('track') || !Number.isInteger(requestedTrack) || requestedTrack < 0 || requestedTrack >= tracks.length) return;

    // The URL query selects the initial track after client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrackIndex(requestedTrack);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[requestedTrack].audio;
    if (params.get('autoplay') === '1') {
      audio.play().catch(() => setPlaying(false));
    }
  }, []);

  async function selectTrack(index: number, autoplay = true) {
    const nextIndex = (index + tracks.length) % tracks.length;
    setTrackIndex(nextIndex);
    setProgress(0);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[nextIndex].audio;
    if (autoplay) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); return; }
    if (!audio.src) audio.src = track.audio;
    try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
  }

  function nextTrack(direction = 1) {
    const next = shuffle ? Math.floor(Math.random() * tracks.length) : trackIndex + direction;
    void selectTrack(next);
  }

  const time = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

  return <main className="music-player-page">
    <audio ref={audioRef} onPlay={(event) => { lastLoggedPosition.current = event.currentTarget.currentTime; setPlaying(true); }} onPause={(event) => { lastLoggedPosition.current = event.currentTarget.currentTime; setPlaying(false); }} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onDurationChange={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => { const audio = event.currentTarget; const position = audio.currentTime; const elapsed = position - lastLoggedPosition.current; lastLoggedPosition.current = position; setProgress(position); if (!audio.paused && elapsed > 0 && elapsed <= 3) addListeningTime(track.title, track.artist, elapsed); }} onEnded={() => repeat ? void selectTrack(trackIndex) : nextTrack()} />
    <div className="music-player-backdrop" style={{ backgroundImage: `url(${track.image})` }} />
    <header className="music-player-top"><Link className="player-glass-button" aria-label="Back to home" href="/"><PlayerIcon name="back" /></Link><div className="song-video-toggle"><button className={mode === 'Song' ? 'selected' : ''} onClick={() => setMode('Song')}>Song</button><button className={mode === 'Video' ? 'selected' : ''} onClick={() => setMode('Video')}>Video</button></div><div className="player-options-wrap"><button className="player-glass-button" aria-label="More options" aria-expanded={showOptions} onClick={() => setShowOptions((value) => !value)}><PlayerIcon name="more" /></button>{showOptions && <div className="player-options-menu"><Link href="/queue"><PlayerIcon name="play" /> View queue</Link></div>}</div></header>
    <section className="music-player-main">
      <div className="music-art-wrap"><img src={track.image} alt={`${track.album} artwork`} className="music-artwork" /><div className={playing ? 'music-art-shine moving' : 'music-art-shine'} /></div>
      <div className="music-title-row"><div><span className="music-overline">PLAYING FROM · {track.album}</span><h1>{track.title}</h1><p>{track.artist}</p></div><button aria-label={liked ? 'Unlike track' : 'Like track'} className={liked ? 'music-like liked' : 'music-like'} onClick={() => toggleLikedTrack(track.title)}><PlayerIcon name="heart" /></button></div>
      <div className="music-actions"><button onClick={() => toggleLikedTrack(track.title)}><PlayerIcon name="heart" /><span>{liked ? 'Liked' : 'Like'}</span></button><button onClick={() => toggleSavedPlaylist(track.title)}><span className="save-plus">{savedMix ? '✓' : '＋'}</span><span>{savedMix ? 'Saved' : 'Save mix'}</span></button></div>
      <div className="music-seek"><input aria-label="Track progress" type="range" min="0" max={duration || 100} value={Math.min(progress, duration || 100)} onChange={(event) => { const value = Number(event.target.value); setProgress(value); if (audioRef.current) audioRef.current.currentTime = value; }} style={{ '--music-progress': `${duration ? progress / duration * 100 : 0}%` } as CSSProperties} /><div><span>{time(progress)}</span><span>{duration ? time(duration) : track.length}</span></div></div>
      <div className="music-controls"><button className={shuffle ? 'music-utility active' : 'music-utility'} aria-label="Shuffle" onClick={() => setShuffle((value) => !value)}><PlayerIcon name="shuffle" /></button><button className="music-skip" aria-label="Previous track" onClick={() => nextTrack(-1)}><PlayerIcon name="previous" /></button><button className="music-big-play" aria-label={playing ? 'Pause' : 'Play'} onClick={() => void togglePlayback()}><PlayerIcon name={playing ? 'pause' : 'play'} /></button><button className="music-skip" aria-label="Next track" onClick={() => nextTrack()}><PlayerIcon name="next" /></button><button className={repeat ? 'music-utility active' : 'music-utility'} aria-label="Repeat" onClick={() => setRepeat((value) => !value)}><PlayerIcon name="repeat" /></button></div>
      <section className="music-lyrics" aria-label="Live lyrics preview">
        <div className="lyrics-heading"><span>LIVE LYRICS PREVIEW</span><span className="lyrics-sync-label">{playing ? 'SYNCED TO PLAYBACK' : 'PRESS PLAY TO PREVIEW'}</span></div>
        <p className="lyrics-disclaimer">Original demo lines · not official song lyrics</p>
        <div className="lyrics-lines" aria-live="polite">{lyrics.map((line, index) => <p className={index === activeLyricIndex ? 'lyrics-line active' : 'lyrics-line'} key={`${trackIndex}-${line.time}`}><span>{line.text}</span><small>{time(line.time)}</small></p>)}</div>
      </section>
      <section className="music-lyrics up-next-card"><div className="lyrics-heading"><span>UP NEXT</span></div><p>Next up: <strong>{tracks[(trackIndex + 1) % tracks.length].title}</strong><br /><span>{tracks[(trackIndex + 1) % tracks.length].artist}</span></p></section>
    </section>
    <footer className="music-player-footer"><span className={playing ? 'music-playing-light on' : 'music-playing-light'} />{playing ? 'Now playing' : 'Ready when you are'}<span className="demo-audio-label">Demo audio preview</span></footer>
    <div className="music-home-indicator" />
  </main>;
}
