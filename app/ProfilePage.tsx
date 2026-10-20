'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import ProfileMark, { notifyProfileChanged } from './ProfileMark';

type DemoUser = {
  name: string;
  email: string;
  genres: string[];
  salt: string;
  passwordHash: string;
};

const usersKey = 'groovy-demo-users';
const sessionKey = 'groovy-demo-session';
const genres = ['Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Soul'];

function ProfileIcon({ name }: { name: 'home' | 'search' | 'play' | 'stats' | 'profile' | 'eye' }) {
  const paths: Record<typeof name, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    play: <path d="m8 5 12 7-12 7z" />,
    stats: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value: string) {
  return new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

async function makePasswordHash(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = new ArrayBuffer(salt.length);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBuffer, iterations: 120_000, hash: 'SHA-256' }, key, 256);
  return toHex(new Uint8Array(bits));
}

function readUsers(): DemoUser[] {
  try {
    const value = localStorage.getItem(usersKey);
    const users = value ? JSON.parse(value) : [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function readSession(users: DemoUser[]) {
  const email = localStorage.getItem(sessionKey);
  return users.find((user) => user.email === email) ?? null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<DemoUser | null>(null);
  const [mode, setMode] = useState<'sign-in' | 'create'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip-Hop', 'R&B']);
  const [showPassword, setShowPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGenres, setEditGenres] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The demo session lives in localStorage, so read it only after client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(readSession(readUsers()));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === 'create') {
        if (users.some((user) => user.email === normalizedEmail)) {
          setMessage('An account for this email is already saved on this browser. Sign in instead.');
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const user: DemoUser = {
          name: name.trim(),
          email: normalizedEmail,
          genres: selectedGenres,
          salt: toHex(salt),
          passwordHash: await makePasswordHash(password, salt),
        };
        localStorage.setItem(usersKey, JSON.stringify([...users, user]));
        localStorage.setItem(sessionKey, user.email);
        setProfile(user);
        notifyProfileChanged();
      } else {
        const user = users.find((savedUser) => savedUser.email === normalizedEmail);
        if (!user || await makePasswordHash(password, fromHex(user.salt)) !== user.passwordHash) {
          setMessage('Email or password did not match a demo profile saved on this browser.');
          return;
        }
        localStorage.setItem(sessionKey, user.email);
        setProfile(user);
        notifyProfileChanged();
      }
      setPassword('');
    } catch {
      setMessage('This browser could not save the demo profile. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function toggleGenre(genre: string) {
    setSelectedGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]);
  }

  function signOut() {
    localStorage.removeItem(sessionKey);
    setProfile(null);
    notifyProfileChanged();
    setMessage('You are signed out of this browser.');
  }

  function beginProfileEdit() {
    if (!profile) return;
    setEditName(profile.name);
    setEditGenres(profile.genres);
    setEditingProfile(true);
  }

  function toggleEditGenre(genre: string) {
    setEditGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]);
  }

  function saveProfileEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const updatedProfile = { ...profile, name: editName.trim(), genres: editGenres };
    const users = readUsers().map((user) => user.email === profile.email ? updatedProfile : user);
    localStorage.setItem(usersKey, JSON.stringify(users));
    setProfile(updatedProfile);
    notifyProfileChanged();
    setEditingProfile(false);
  }

  return (
    <main className="groovy-stage">
      <section className="groovy-phone profile-screen" aria-label="Groovy account and profile">
        <div className="phone-status"><span>11:30</span><span className="dynamic-island" /><span className="status-right"><i /> ◔ ▰</span></div>
        <header className="profile-screen-header"><Link className="profile-header-back" href="/" aria-label="Back to Home">‹</Link><strong>My profile</strong><span className="profile-header-mark"><ProfileMark fallback="G" /></span></header>
        <div className="profile-screen-content">
          {profile ? <>
            <section className="profile-hero-card">
              <div className="profile-large-avatar">{profile.name.slice(0, 1).toUpperCase()}</div>
              <span className="profile-member-label">GROOVY MEMBER · DEMO</span>
              <h1>{profile.name}</h1>
              <p>{profile.email}</p>
              <div className="profile-hero-actions"><button className="profile-signout" onClick={beginProfileEdit}>Edit profile</button><button className="profile-signout" onClick={signOut}>Sign out</button></div>
            </section>
            <section className="profile-subscription-card"><div><span className="profile-card-overline">YOUR MEMBERSHIP</span><h2>Subscriber preview</h2><p>Subscription billing will connect when Groovy adds its account service.</p></div><span className="profile-demo-pill">DEMO</span></section>
            {editingProfile ? <form className="profile-detail-card profile-edit-card" onSubmit={saveProfileEdit}>
              <div className="profile-card-heading"><h2>Edit your profile</h2><span>PERSONALIZE</span></div>
              <label>Display name<input value={editName} onChange={(event) => setEditName(event.target.value)} required minLength={2} maxLength={40} /></label>
              <fieldset className="profile-genre-field"><legend>Favorite genres</legend><div>{genres.map((genre) => <button type="button" key={genre} className={editGenres.includes(genre) ? 'profile-genre-chip selected' : 'profile-genre-chip'} onClick={() => toggleEditGenre(genre)}>{genre}</button>)}</div></fieldset>
              <div className="profile-edit-actions"><button type="button" onClick={() => setEditingProfile(false)}>Cancel</button><button type="submit">Save changes</button></div>
            </form> : <section className="profile-detail-card"><div className="profile-card-heading"><h2>Your music taste</h2><span>PERSONALIZED</span></div><p>We’ll use these genres to shape recommendations for your profile.</p><div className="profile-genre-list">{(profile.genres.length ? profile.genres : ['Choose genres to personalize']).map((genre) => <span key={genre}>{genre}</span>)}</div></section>}
            <section className="profile-detail-card profile-stat-card"><div className="profile-card-heading"><h2>Your Groovy</h2><span>DEMO STATS</span></div><div className="profile-stat-grid"><div><strong>0</strong><span>minutes listened</span></div><div><strong>{profile.genres.length}</strong><span>favorite genres</span></div></div><p>Your listening history will appear here as you use Groovy.</p></section>
          </> : <>
            <p className="micro-label profile-eyebrow">YOUR MUSIC. YOUR ACCOUNT.</p>
            <h1 className="profile-welcome">{mode === 'sign-in' ? <>Welcome<br />back<span>.</span></> : <>Make it<br />yours<span>.</span></>}</h1>
            <p className="profile-intro">{mode === 'sign-in' ? 'Sign in to open your personal Groovy profile.' : 'Create a demo profile and choose the sounds you love.'}</p>
            <div className="profile-mode-switch"><button className={mode === 'sign-in' ? 'selected' : ''} onClick={() => { setMode('sign-in'); setMessage(''); }}>Sign in</button><button className={mode === 'create' ? 'selected' : ''} onClick={() => { setMode('create'); setMessage(''); }}>Create profile</button></div>
            <form className="profile-form" onSubmit={handleSubmit}>
              {mode === 'create' && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" required minLength={2} /></label>}
              <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
              <label>Password<span className="password-input-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}><ProfileIcon name="eye" /></button></span></label>
              {mode === 'create' && <fieldset className="profile-genre-field"><legend>Pick your favorite genres</legend><div>{genres.map((genre) => <button type="button" key={genre} className={selectedGenres.includes(genre) ? 'profile-genre-chip selected' : 'profile-genre-chip'} onClick={() => toggleGenre(genre)}>{genre}</button>)}</div></fieldset>}
              {message && <p className="profile-message" role="status">{message}</p>}
              <button className="profile-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : mode === 'sign-in' ? 'Sign in to Groovy' : 'Create my profile'}</button>
            </form>
            <p className="profile-demo-note">DEMO ACCOUNT · Saved only in this browser. No real subscription or online account is created.</p>
          </>}
        </div>
        <nav className="bottom-nav" aria-label="Main navigation">
          {([{ name: 'Home', icon: 'home', href: '/' }, { name: 'Search', icon: 'search', href: '/search' }, { name: 'Player', icon: 'play', href: '/music-player' }, { name: 'Stats', icon: 'stats', href: '/stats' }, { name: 'Profile', icon: 'profile', href: '/profile' }] as const).map((tab) => <Link className={tab.name === 'Profile' ? 'nav-tab active' : 'nav-tab'} href={tab.href} key={tab.name} aria-label={tab.name}><span className="nav-icon">{tab.name === 'Profile' ? <ProfileMark /> : <ProfileIcon name={tab.icon} />}</span><small>{tab.name}</small></Link>)}
        </nav>
      </section>
    </main>
  );
}
