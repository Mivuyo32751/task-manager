'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tracks } from './music-data';
import { readLibrary, subscribeToLibrary, toggleLikedTrack, toggleSavedPlaylist, type LibraryState } from './library-store';

type LibraryTab = 'All' | 'Liked songs' | 'Saved mixes';

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.5 4.5 0 0 1 8.8-1.2 4.5 4.5 0 0 1 8.8 1.2Z" /></svg>;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m8 5 12 7-12 7z" /></svg>;
}

export default function Library() {
  const [library, setLibrary] = useState<LibraryState>({ likedTracks: [], savedPlaylists: [] });
  const [tab, setTab] = useState<LibraryTab>('All');

  useEffect(() => {
    const refresh = () => setLibrary(readLibrary());
    refresh();
    return subscribeToLibrary(refresh);
  }, []);

  const liked = tracks.map((track, index) => ({ track, index })).filter(({ track }) => library.likedTracks.includes(track.title));
  const saved = tracks.map((track, index) => ({ track, index })).filter(({ track }) => library.savedPlaylists.includes(track.title));
  const showLiked = tab !== 'Saved mixes';
  const showSaved = tab !== 'Liked songs';
  const hasItems = (showLiked && liked.length > 0) || (showSaved && saved.length > 0);

  return (
    <main className="groovy-stage" id="library">
      <section className="groovy-phone library-screen" aria-label="Your Groovy library">
        <div className="phone-status"><span>11:30</span><span className="dynamic-island" /><span className="status-right"><i /> ◔ ▰</span></div>
        <header className="library-header"><Link className="library-back" href="/" aria-label="Back to home">‹</Link><strong>Your Library</strong><Link className="library-home-link" href="/">G</Link></header>
        <div className="library-content">
          <p className="micro-label">YOUR MUSIC. YOUR COLLECTION.</p>
          <h1 className="library-title">Made for <span>you.</span></h1>
          <p className="library-description">The songs you love and mixes you want to keep close.</p>
          <div className="library-tabs" role="tablist" aria-label="Filter library">
            {(['All', 'Liked songs', 'Saved mixes'] as LibraryTab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item}</button>)}
          </div>
          {showLiked && <section className="library-section" aria-label="Liked songs">
            <div className="library-section-heading"><div><h2>Liked songs</h2><p>Songs with a little extra heart</p></div><span>{liked.length}</span></div>
            {liked.length ? <div className="library-track-list">{liked.map(({ track, index }) => <article className="library-track" key={track.title}>
              <img src={track.image} alt="" /><span className="library-track-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
              <button className="library-remove-like" aria-label={`Unlike ${track.title}`} onClick={() => toggleLikedTrack(track.title)}><HeartIcon filled /></button>
              <Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${track.title}`}><PlayIcon /></Link>
            </article>)}</div> : <div className="library-empty"><span className="library-empty-icon"><HeartIcon /></span><strong>Your liked songs will show up here</strong><p>Tap the heart on a song in the player to keep it in this collection.</p><Link href="/music-player">Explore the player</Link></div>}
          </section>}
          {showSaved && <section className="library-section" aria-label="Saved mixes">
            <div className="library-section-heading"><div><h2>Saved mixes</h2><p>Your daily mixes, ready when you are</p></div><span>{saved.length}</span></div>
            {saved.length ? <div className="library-track-list">{saved.map(({ track, index }) => <article className="library-track" key={track.title}>
              <img src={track.image} alt="" /><span className="library-track-copy"><strong>{track.title}</strong><small>{track.album} · {track.artist}</small></span>
              <button className="library-unsave" aria-label={`Remove ${track.title} from saved mixes`} onClick={() => toggleSavedPlaylist(track.title)}>−</button>
              <Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${track.title}`}><PlayIcon /></Link>
            </article>)}</div> : <div className="library-empty"><span className="library-empty-icon library-mix-icon">♫</span><strong>No mixes saved yet</strong><p>Use Save in the player or save a mix from Home to find it here.</p><Link href="/">Browse mixes</Link></div>}
          </section>}
          {hasItems && <p className="library-tip"><strong>Groovy tip</strong> Save mixes you return to often and tap the heart on songs you want to remember.</p>}
          <p className="demo-note">Library items are saved on this browser for your demo account.</p>
        </div>
        <nav className="library-bottom-nav" aria-label="Main navigation"><Link href="/" aria-label="Home">⌂<small>Home</small></Link><Link href="/search" aria-label="Search">⌕<small>Search</small></Link><Link href="/library" aria-current="page" className="active" aria-label="Library"><HeartIcon /><small>Library</small></Link><Link href="/profile" aria-label="Profile">◉<small>Profile</small></Link></nav>
      </section>
    </main>
  );
}
