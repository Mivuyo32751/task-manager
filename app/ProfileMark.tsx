'use client';

import { useEffect, useState } from 'react';

type ProfileMarkProps = { fallback?: 'profile' | 'G' };

function readInitial() {
  try {
    const email = localStorage.getItem('groovy-demo-session');
    const savedUsers = localStorage.getItem('groovy-demo-users');
    const users = savedUsers ? JSON.parse(savedUsers) as { email?: string; name?: string }[] : [];
    const user = users.find((item) => item.email === email);
    return user?.name?.trim().charAt(0).toUpperCase() ?? '';
  } catch {
    return '';
  }
}

export function notifyProfileChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('groovy-profile-updated'));
}

export default function ProfileMark({ fallback = 'profile' }: ProfileMarkProps) {
  const [initial, setInitial] = useState('');

  useEffect(() => {
    const refresh = () => setInitial(readInitial());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('groovy-profile-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('groovy-profile-updated', refresh);
    };
  }, []);

  if (initial) return initial;
  if (fallback === 'G') return 'G';
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
