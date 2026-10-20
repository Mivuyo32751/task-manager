'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localDay, readListeningHistory, subscribeToListeningHistory, type DailyListening } from './listening-history';

function dateKey(date: Date) {
  return localDay(date);
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'short' }).format(date);
}

function formatRange(days: Date[]) {
  if (days.length < 7) return 'This week';
  const start = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' }).format(days[0]);
  const end = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(days[6]);
  return `${start} – ${end}`;
}

function formatMinutes(seconds: number) {
  return Math.floor(seconds / 60).toLocaleString('en-ZA');
}

export default function StatsPage() {
  const [history, setHistory] = useState<DailyListening[]>([]);
  const [shareMessage, setShareMessage] = useState('');
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const refresh = () => setHistory(readListeningHistory());
    refresh();
    return subscribeToListeningHistory(refresh);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDays(Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      return date;
    }));
  }, []);
  const weekHistory = days.map((day) => history.find((entry) => entry.day === dateKey(day)) ?? { day: dateKey(day), seconds: 0, tracks: {} });
  const totalSeconds = weekHistory.reduce((total, entry) => total + entry.seconds, 0);
  const trackTotals = new Map<string, { artist: string; seconds: number }>();
  weekHistory.forEach((entry) => Object.entries(entry.tracks).forEach(([title, item]) => {
    const current = trackTotals.get(title) ?? { artist: item.artist, seconds: 0 };
    current.seconds += item.seconds;
    trackTotals.set(title, current);
  }));
  const topTracks = [...trackTotals.entries()].sort((a, b) => b[1].seconds - a[1].seconds).slice(0, 5);
  const uniqueTracks = [...trackTotals.values()].filter((item) => item.seconds >= 5).length;
  const maxDay = Math.max(60, ...weekHistory.map((entry) => entry.seconds));
  const hasListening = totalSeconds > 0;

  async function shareStats() {
    try {
      if (navigator.share) await navigator.share({ title: 'My Groovy listening stats', text: `I listened to ${formatMinutes(totalSeconds)} minutes this week on Groovy.` });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Link copied');
        window.setTimeout(() => setShareMessage(''), 2200);
      }
    } catch {
      setShareMessage('Sharing isn’t available right now');
      window.setTimeout(() => setShareMessage(''), 2200);
    }
  }

  return (
    <main className="stats-page">
      <aside className="stats-sidebar">
        <Link className="stats-brand" href="/" aria-label="Groovy home"><span>g</span>roovy</Link>
        <p>YOUR SPACE</p>
        <nav aria-label="Main navigation">
          <Link href="/">⌂<span>Home</span></Link>
          <Link href="/search">⌕<span>Search</span></Link>
          <Link href="/library">♡<span>Your Library</span></Link>
          <Link href="/stats" aria-current="page" className="active">▥<span>Listening stats</span></Link>
          <Link href="/profile">◉<span>Profile</span></Link>
        </nav>
        <div className="stats-sidebar-note"><span>GROOVY PREVIEW</span><p>Your listening insights update as you play demo tracks.</p></div>
      </aside>

      <div className="stats-main">
        <header className="stats-topbar">
          <Link href="/" className="stats-mobile-back" aria-label="Back to home">‹</Link>
          <span className="stats-topbar-brand"><b>g</b>roovy</span>
          <span className="stats-topbar-label">LISTENING INSIGHTS</span>
          <button className="stats-share-button" onClick={() => void shareStats()} aria-label="Share listening stats"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v8h14v-8" /></svg><span>Share</span></button>
        </header>

        <div className="stats-content">
          <section className="stats-intro">
            <div><p className="stats-eyebrow">YOUR WEEK IN MUSIC</p><h1>Listening stats<span>.</span></h1><p className="stats-period">{formatRange(days)} <span>·</span> updates as you listen</p></div>
            {shareMessage && <span className="stats-feedback" role="status">{shareMessage}</span>}
          </section>

          <section className="stats-summary" aria-label="Weekly summary">
            <article className="stats-summary-card stats-summary-primary"><span>TIME LISTENED</span><strong>{formatMinutes(totalSeconds)}<small> min</small></strong><p>{hasListening ? 'This week on this device' : 'Your listening time will appear here'}</p></article>
            <article className="stats-summary-card"><span>TRACKS PLAYED</span><strong>{uniqueTracks}</strong><p>{uniqueTracks ? 'Different tracks this week' : 'Play a track to get started'}</p></article>
            <article className="stats-summary-card"><span>TOP TRACK</span><strong className="stats-top-track-title">{topTracks[0]?.[0] ?? 'Not yet available'}</strong><p>{topTracks[0]?.[1].artist ?? 'Your most played track will show here'}</p></article>
          </section>

          <div className="stats-detail-grid">
            <section className="stats-panel weekly-chart-panel">
              <div className="stats-panel-heading"><div><h2>Listening activity</h2><p>Minutes listened each day</p></div><span className="stats-live-indicator"><i /> THIS WEEK</span></div>
              <div className="weekly-chart" role="img" aria-label="Listening minutes for the last seven days">
                {weekHistory.map((entry, index) => <div className="weekly-chart-day" key={entry.day} title={`${formatMinutes(entry.seconds)} minutes`}><div className="weekly-chart-track"><span style={{ height: `${Math.max(entry.seconds ? 5 : 2, entry.seconds / maxDay * 100)}%` }} /></div><small>{shortDay(days[index])}</small></div>)}
              </div>
              <p className="stats-chart-footnote">{hasListening ? `${formatMinutes(totalSeconds)} minutes counted from playback in Groovy.` : 'Start a song in the player. Groovy will count real playback time here.'}</p>
            </section>

            <section className="stats-panel top-tracks-panel">
              <div className="stats-panel-heading"><div><h2>Your top tracks</h2><p>Ranked by listening time this week</p></div><span className="stats-rank-label">TOP 5</span></div>
              {topTracks.length ? <ol className="stats-track-list">{topTracks.map(([title, item], index) => <li key={title}><span className="stats-track-rank">{String(index + 1).padStart(2, '0')}</span><span className="stats-track-copy"><strong>{title}</strong><small>{item.artist}</small></span><span className="stats-track-minutes">{formatMinutes(item.seconds)}m</span></li>)}</ol> : <div className="stats-empty"><span>♫</span><strong>No listening data yet</strong><p>Play something from Groovy and your top tracks will build here.</p><Link href="/music-player">Open music player <span>→</span></Link></div>}
            </section>
          </div>

          <p className="stats-data-note">Preview stats are saved in this browser for your demo profile. Connect the backend to sync listening history across devices.</p>
        </div>
      </div>
    </main>
  );
}
