'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ProfileMark from './ProfileMark';
import { readLibrary, subscribeToLibrary, toggleSavedPlaylist } from './library-store';

const artists = [
  { name: 'Drake', followers: '23M', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Drake_in_2017.jpg', credit: 'GabboT · CC BY-SA 2.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Drake_in_2017.jpg' },
  { name: 'SZA', followers: '18M', genre: 'R&B', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/SZA_in_2024.jpg', credit: 'Raph_PH · CC BY 2.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:SZA_in_2024.jpg' },
  { name: 'Kendrick Lamar', followers: '30M', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Pulitzer2018-portraits-kendrick-lamar.jpg', credit: 'Fuzheado · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Pulitzer2018-portraits-kendrick-lamar.jpg' },
  { name: 'J. Cole', followers: '16M', genre: 'Hip-Hop', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/J._Cole_in_2023.png', credit: 'HOTSPOTATL · CC BY 3.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:J._Cole_in_2023.png' },
  { name: 'Tems', followers: '12M', genre: 'Afrobeats', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Tems_in_2025.jpg', credit: 'Patrick Cristiano · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Tems_in_2025.jpg' },
];

const songs = [
  { title: 'Late Night Rotation', artist: 'Hip-Hop · Drake, Kendrick, J. Cole', duration: '02:48', art: 'song-sunset', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=160&q=80', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Soft Focus', artist: 'R&B · SZA, Tems', duration: '03:12', art: 'song-blue', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=160&q=80', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Afro Sunset', artist: 'Afrobeats · Tems & friends', duration: '03:36', art: 'song-green', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&q=80', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const genreMixes = [
  { title: 'Hip-Hop Heat', genre: 'Hip-Hop', detail: 'Drake · Kendrick · J. Cole', style: 'mix-hiphop' },
  { title: 'Slow Burn', genre: 'R&B', detail: 'SZA · Tems · smooth cuts', style: 'mix-rnb' },
  { title: 'Afro Pulse', genre: 'Afrobeats', detail: 'Afrobeats · Amapiano', style: 'mix-afro' },
  { title: 'Pop Now', genre: 'Pop', detail: 'Big hooks · bright energy', style: 'mix-pop' },
  { title: 'After Hours', genre: 'Electronic', detail: 'House · electronic · dance', style: 'mix-electronic' },
  { title: 'Easy Sunday', genre: 'Soul', detail: 'Soul · jazz · laid-back', style: 'mix-soul' },
];

const demoAlbums = [
  { title: 'Neon Afterglow', artist: 'Groovy Studio · R&B', style: 'album-rose' },
  { title: 'City in Motion', artist: 'Groovy Studio · Hip-Hop', style: 'album-blue' },
  { title: 'Golden Hour', artist: 'Groovy Studio · Afrobeats', style: 'album-gold' },
  { title: 'Night Drive', artist: 'Groovy Studio · Electronic', style: 'album-violet' },
];

function Icon({ name }: { name: 'search' | 'heart' | 'bell' | 'home' | 'discover' | 'mood' | 'profile' | 'play' | 'pause' | 'close' | 'sparkle' | 'stats' }) {
  const paths: Record<typeof name, ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    heart: <path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.5 4.5 0 0 1 8.8-1.2 4.5 4.5 0 0 1 8.8 1.2Z" />,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    discover: <><circle cx="11" cy="11" r="8" /><path d="m14.5 7.5-2 5-5 2 2-5z" /></>,
    mood: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /><circle cx="12" cy="12" r="5" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    play: <path d="m8 5 12 7-12 7z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
    stats: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function HomePage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const artistCarouselRef = useRef<HTMLDivElement>(null);
  const mixesCarouselRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [showMood, setShowMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const [savedMixes, setSavedMixes] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setSavedMixes(readLibrary().savedPlaylists);
    refresh();
    return subscribeToLibrary(refresh);
  }, []);

  const matchingArtists = artists.filter((artist) => artist.name.toLowerCase().includes(query.toLowerCase()) || artist.genre.toLowerCase().includes(query.toLowerCase()));

  function toggleFollow(name: string) {
    setFollowing((current) => current. includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function exploreGenre(genre: string) {
    setQuery(genre);
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollCarousel(carousel: HTMLDivElement | null, direction: -1 | 1) {
    carousel?.scrollBy({ left: direction * 220, behavior: 'smooth' });
  }

  function handleTab(tab: string) {
    setActiveTab(tab);
    if (tab === 'Search') searchRef.current?.focus();
    if (tab === 'Mood') setShowMood((current) => !current);
    if (tab === 'Discover') document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="groovy-stage" id="home">
      <section className="groovy-phone" aria-label="Groovy music home">
        <div className="phone-status"><span>11:30</span><span className="dynamic-island" /><span className="status-right"><i /> ◔ ▰</span></div>
        <header className="home-profile">
          <div className="profile-avatar"><span><ProfileMark fallback="G" /></span><i /></div>
          <div className="profile-greeting"><span>Good to see you,</span><strong>Groovy listener</strong></div>
          <button className="notification-button" aria-label="Notifications"><Icon name="bell" /><b>16</b></button>
          <Link href="/library" className="header-heart" aria-label="Your Library"><Icon name="heart" /></Link>
        </header>

        <div className="home-scroll">
          <section className="welcome-section">
            <p className="micro-label">YOUR MUSIC. YOUR FLOW.</p>
            <h1>Listen to what<br />moves you<span>.</span></h1>
          </section>

          <section className="search-section" aria-label="Search music">
            <label className="search-box"><Icon name="search" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search music, artists, podcasts..." /><button className={showMood ? 'ai-mode active' : 'ai-mode'} onClick={() => setShowMood((current) => !current)}><Icon name="sparkle" /><span>AI Mode</span></button></label>
            {showMood && <div className="mood-panel"><div><strong>What’s your mood?</strong><span>Pick a vibe for your next mix</span></div><div className="mood-options">{['Chill', 'Focused', 'Good energy'].map((mood) => <button key={mood} className={selectedMood === mood ? 'mood-chip selected' : 'mood-chip'} onClick={() => setSelectedMood(mood)}>{mood}</button>)}</div>{selectedMood && <p className="mood-response">Your {selectedMood.toLowerCase()} mix is ready to explore.</p>}</div>}
          </section>

          <section className="home-section" id="trending">
            <div className="section-title-row"><h2>Trending artists</h2><div className="carousel-heading-actions"><button className="see-all" onClick={() => setQuery('')}>See all</button><div className="carousel-controls"><button onClick={() => scrollCarousel(artistCarouselRef.current, -1)} aria-label="Scroll artists left">‹</button><button onClick={() => scrollCarousel(artistCarouselRef.current, 1)} aria-label="Scroll artists right">›</button></div></div></div>
            <div className="artist-carousel" ref={artistCarouselRef}>{matchingArtists.map((artist) => <article className="trending-card" key={artist.name}>
              <div className="artist-art"><img src={artist.image} alt={artist.name} /><button className="artist-like" aria-label={`Follow ${artist.name}`} onClick={() => toggleFollow(artist.name)}><Icon name="heart" /></button><div className="artist-caption"><strong>{artist.name}</strong><span>{artist.genre}</span></div></div>
              <p className="follower-count">{artist.followers} followers</p>
              <button className={following.includes(artist.name) ? 'follow-button following' : 'follow-button'} onClick={() => toggleFollow(artist.name)}>{following.includes(artist.name) ? 'Following' : 'Follow'}</button>
            </article>)}</div>
            {matchingArtists.length === 0 && <p className="empty-search">No artists match “{query}”. Try another search.</p>}
          </section>

          <section className="home-section playlists-section">
            <div className="section-title-row"><div><h2>Top daily playlists</h2><p className="section-subtitle">A little something for every mood</p></div><button className="see-all" onClick={() => setQuery('')}>See all</button></div>
            <div className="playlist-list">{songs.map((song, index) => <article className="playlist-row" key={song.title}>
              <span className={`playlist-art ${song.art}`} style={{ backgroundImage: `linear-gradient(145deg,#0002,#0009),url(${song.image})` }}><i /></span><div className="playlist-copy"><strong>{song.title}</strong><span>{song.artist}</span></div><button className={savedMixes.includes(song.title) ? 'mix-save-button saved' : 'mix-save-button'} aria-label={savedMixes.includes(song.title) ? `Remove ${song.title} from Library` : `Save ${song.title} to Library`} onClick={() => toggleSavedPlaylist(song.title)}>{savedMixes.includes(song.title) ? '✓' : '＋'}</button><span className="song-length">{song.duration}</span><Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${song.title}`}><Icon name="play" /></Link>
            </article>)}</div>
          </section>

          <section className="home-section genre-mixes-section" id="genre-mixes">
            <div className="section-title-row"><div><h2>Mixes by genre</h2><p className="section-subtitle">Find a sound for every side of you</p></div><div className="carousel-controls"><button onClick={() => scrollCarousel(mixesCarouselRef.current, -1)} aria-label="Scroll mixes left">‹</button><button onClick={() => scrollCarousel(mixesCarouselRef.current, 1)} aria-label="Scroll mixes right">›</button></div></div>
            <div className="mix-carousel genre-mix-carousel" ref={mixesCarouselRef}>{genreMixes.map((mix) => <button className="mix-card genre-mix-card" key={mix.title} onClick={() => exploreGenre(mix.genre)} aria-label={`Explore ${mix.genre} music`}>
              <span className={`mix-cover ${mix.style}`}><i /><i /><i /><b>{mix.genre.toUpperCase()}</b></span><strong>{mix.title}</strong><span>{mix.detail}</span>
            </button>)}</div>
          </section>

          <section className="home-section chart-section">
            <div className="section-title-row"><div><h2>Billboard Hot 100</h2><p className="section-subtitle">Demo chart preview</p></div><span className="chart-badge">DEMO</span></div>
            <div className="chart-list">{songs.map((song, index) => <article className="chart-row" key={song.title}>
              <span className="chart-rank">{String(index + 1).padStart(2, '0')}</span><span className={`chart-art ${song.art}`} style={{ backgroundImage: `linear-gradient(145deg,#0002,#0009),url(${song.image})` }} /><span className="chart-copy"><strong>{song.title}</strong><small>{song.artist}</small></span><Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${song.title}`}><Icon name="play" /></Link>
            </article>)}</div>
          </section>

          <section className="home-section album-chart-section">
            <div className="section-title-row"><div><h2>Billboard 200 Albums</h2><p className="section-subtitle">Demo album cards · rankings aren’t live</p></div><span className="chart-badge">DEMO</span></div>
            <div className="album-carousel">{demoAlbums.map((album, index) => <article className="album-card" key={album.title}>
              <span className={`album-cover ${album.style}`}><i /><b>{album.title}</b></span><span className="album-rank">#{index + 1} sample</span><strong>{album.title}</strong><small>{album.artist}</small>
            </article>)}</div>
          </section>

          <p className="demo-note">Artist and playlist artwork is illustrative. Audio controls use demo previews.</p>
          <details className="photo-credits"><summary>Artist photo credits</summary><div>{artists.map((artist) => <a key={artist.name} href={artist.creditUrl} target="_blank" rel="noreferrer">{artist.name}: {artist.credit}</a>)}</div></details>
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">{[
          { name: 'Home', icon: 'home' as const, href: '/' },
          { name: 'Search', icon: 'search' as const, href: '/search' },
          { name: 'Player', icon: 'play' as const, href: '/music-player' },
          { name: 'Stats', icon: 'stats' as const, href: '/stats' },
          { name: 'Profile', icon: 'profile' as const, href: '/profile' },
        ].map((tab) => {
          const content = <><span className="nav-icon">{tab.name === 'Profile' ? <ProfileMark /> : <Icon name={tab.icon} />}</span><small>{tab.name}</small></>;
          const className = activeTab === tab.name ? 'nav-tab active' : 'nav-tab';
          return tab.href
            ? <Link className={className} href={tab.href} key={tab.name} aria-label={tab.name}>{content}</Link>
            : <button className={className} key={tab.name} onClick={() => handleTab(tab.name)} aria-label={tab.name}>{content}</button>;
        })}</nav>
      </section>
    </main>
  );
}

