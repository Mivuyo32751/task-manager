import Link from 'next/link';
import { tracks } from '../music-data';

function QueuePlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m8 5 12 7-12 7z" /></svg>;
}

function BackIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}

export default function QueuePage() {
  return (
    <main className="groovy-stage">
      <section className="groovy-phone queue-screen" aria-label="Groovy playback queue">
        <div className="phone-status"><span>11:30</span><span className="dynamic-island" /><span className="status-right"><i /> ◔ ▰</span></div>
        <header className="queue-screen-header"><Link className="player-glass-button" href="/music-player" aria-label="Back to player"><BackIcon /></Link><strong>Queue</strong><span className="queue-header-space" /></header>
        <div className="queue-screen-content">
          <p className="micro-label">YOUR LISTENING FLOW</p>
          <h1 className="queue-title">Up next<span>.</span></h1>
          <p className="queue-description">The tracks lined up in your Groovy demo queue.</p>
          <div className="queue-now-playing"><span className="queue-now-art" style={{ backgroundImage: `url(${tracks[0].image})` }} /><span><small>DEMO QUEUE</small><strong>{tracks.length} tracks ready</strong></span><span className="queue-live-dot" /></div>
          <section className="queue-track-list" aria-label="Tracks in queue">
            {tracks.map((track, index) => <article className="queue-page-track" key={track.title}>
              <span className="queue-page-rank">{String(index + 1).padStart(2, '0')}</span>
              <img src={track.image} alt="" />
              <span className="queue-page-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
              <span className="queue-page-length">{track.length}</span>
              <Link className="row-play" href={`/music-player?track=${index}&autoplay=1`} aria-label={`Play ${track.title}`}><QueuePlayIcon /></Link>
            </article>)}
          </section>
          <p className="demo-note">Audio and queue entries are demo content.</p>
        </div>
        <div className="music-home-indicator" />
      </section>
    </main>
  );
}
