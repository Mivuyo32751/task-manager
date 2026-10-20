'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProfileMark from './ProfileMark';

const genres = ['For you', 'Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic'];
const artists = [
  { name: 'Drake', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Drake_in_2017.jpg' },
  { name: 'SZA', genre: 'R&B', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/SZA_in_2024.jpg' },
  { name: 'Kendrick Lamar', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Pulitzer2018-portraits-kendrick-lamar.jpg' },
  { name: 'J. Cole', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/J._Cole_in_2023.png' },
  { name: 'Tems', genre: 'Afrobeats', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Tems_in_2025.jpg' },
];
const playlists = [
  { title: 'Late Night Rotation', detail: 'Hip-Hop · Drake, Kendrick, J. Cole', genre: 'Hip-Hop', duration: '02:48', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=160&q=80' },
  { title: 'Soft Focus', detail: 'R&B · SZA, Tems', genre: 'R&B', duration: '03:12', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=160&q=80' },
  { title: 'Afro Sunset', detail: 'Afrobeats · Tems & friends', genre: 'Afrobeats', duration: '03:36', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&q=80' },
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
}

function DiscoverIcon({ name }: { name: 'home' | 'search' | 'play' | 'stats' | 'profile' }) {
  const shapes = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    play: <path d="m8 5 12 7-12 7z" />,
    stats: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
}

export default function SearchDiscover() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('For you');
  const normalized = query.trim().toLowerCase();
  const matchingArtists = useMemo(() => artists.filter((artist) =>
    (genre === 'For you' || artist.genre === genre) &&
    (!normalized || `${artist.name} ${artist.genre}`.toLowerCase().includes(normalized))), [genre, normalized]);
  const matchingPlaylists = useMemo(() => playlists.filter((playlist) =>
    (genre === 'For you' || playlist.genre === genre) &&
    (!normalized || `${playlist.title} ${playlist.detail} ${playlist.genre}`.toLowerCase().includes(normalized))), [genre, normalized]);

  return (
    <main className="groovy-stage">
      <section className="groovy-phone" aria-label="Groovy Search and Discover">
        <div className="phone-status"><span>11:30</span><span className="dynamic-island" /><span className="status-right"><i /> ◔ ▰</span></div>
        <header className="discover-top"><Link href="/" aria-label="Back to Home">‹</Link><strong>Search &amp; Discover</strong><span className="discover-top-mark">✦</span></header>
        <div className="discover-scroll">
          <p className="micro-label">FIND YOUR NEXT FAVORITE</p>
          <h1 className="discover-heading">Explore music<span>.</span></h1>
          <label className="discover-search"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Songs, artists, genres..." aria-label="Search songs, artists, and genres" />{query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>

          <div className="genre-chips" aria-label="Filter by genre">{genres.map((item) => <button key={item} className={genre === item ? 'genre-chip selected' : 'genre-chip'} onClick={() => setGenre(item)}>{item}</button>)}</div>

          <section className="discover-section">
            <div className="section-title-row"><div><h2>{normalized ? 'Artists' : 'Trending artists'}</h2><p className="section-subtitle">The voices in your rotation</p></div><span className="discover-spark">✦</span></div>
            {matchingArtists.length ? <div className="discover-artists">{matchingArtists.map((artist) => <article className="discover-artist" key={artist.name}><div className="discover-artist-photo"><img src={artist.image} alt={artist.name} /><span>{artist.genre}</span></div><strong>{artist.name}</strong></article>)}</div> : <p className="discover-empty">No artists found. Try a different search or genre.</p>}
          </section>

          <section className="discover-section discover-playlists">
            <div className="section-title-row"><div><h2>{normalized ? 'Playlists' : 'Made for your mood'}</h2><p className="section-subtitle">A little something for every mood</p></div></div>
            {matchingPlaylists.length ? <div className="playlist-list">{matchingPlaylists.map((playlist) => {
              const index = playlists.findIndex((item) => item.title === playlist.title);
              return <article className="playlist-row" key={playlist.title}><span className="playlist-art" style={{ backgroundImage: `linear-gradient(145deg,#0002,#0009),url(${playlist.image})` }} /><div className="playlist-copy"><strong>{playlist.title}</strong><span>{playlist.detail}</span></div><span className="song-length">{playlist.duration}</span><Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${playlist.title}`}><DiscoverIcon name="play" /></Link></article>;
            })}</div> : <p className="discover-empty">No playlists found. Try another search or genre.</p>}
          </section>
          <p className="demo-note">Artist and playlist artwork is illustrative. Audio controls use demo previews.</p>
          <details className="photo-credits"><summary>Artist photo credits</summary><div><a href="https://commons.wikimedia.org/wiki/File:Drake_in_2017.jpg" target="_blank" rel="noreferrer">Drake: GabboT · CC BY-SA 2.0</a><a href="https://commons.wikimedia.org/wiki/File:SZA_in_2024.jpg" target="_blank" rel="noreferrer">SZA: Raph_PH · CC BY 2.0</a><a href="https://commons.wikimedia.org/wiki/File:Pulitzer2018-portraits-kendrick-lamar.jpg" target="_blank" rel="noreferrer">Kendrick Lamar: Fuzheado · CC BY-SA 4.0</a><a href="https://commons.wikimedia.org/wiki/File:J._Cole_in_2023.png" target="_blank" rel="noreferrer">J. Cole: HOTSPOTATL · CC BY 3.0</a><a href="https://commons.wikimedia.org/wiki/File:Tems_in_2025.jpg" target="_blank" rel="noreferrer">Tems: Patrick Cristiano · CC BY-SA 4.0</a></div></details>
        </div>
        <nav className="bottom-nav" aria-label="Main navigation">
          {([{ name: 'Home', icon: 'home', href: '/' }, { name: 'Search', icon: 'search', href: '/search' }, { name: 'Player', icon: 'play', href: '/music-player' }, { name: 'Stats', icon: 'stats', href: '/stats' }, { name: 'Profile', icon: 'profile', href: '/profile' }] as const).map((tab) => <Link className={tab.name === 'Search' ? 'nav-tab active' : 'nav-tab'} href={tab.href} key={tab.name} aria-label={tab.name}><span className="nav-icon">{tab.name === 'Profile' ? <ProfileMark /> : <DiscoverIcon name={tab.icon} />}</span><small>{tab.name}</small></Link>)}
        </nav>
      </section>
    </main>
  );
}
