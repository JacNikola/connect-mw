import React, { useState } from 'react';
import type { Account, AppState } from './types';
import { DEFAULT_ME, DEPARTMENTS, LOCATIONS, newUserState, seedState } from './data';
import { Button, Icon, Logo, cx } from './ui';

// Prototype-only accounts. Everything lives in this browser's localStorage; a real
// deployment would use corporate SSO instead of passwords.
const ACCOUNTS_KEY = 'connectmw.accounts.v1';
const SESSION_KEY = 'connectmw.session.v1';
const STATE_KEY = 'connectmw.prototype.v1';
export const DEMO_EMAIL = 'demo';

export interface Session { email: string; name: string; stateKey: string; fresh: () => AppState }

/** Demo-only obfuscation so passwords aren't stored as plain text. This is NOT secure hashing. */
function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}

function readAccounts(): Account[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as Account[]; } catch { return []; }
}

function sessionFor(email: string): Session | null {
  // The demo account keeps the original storage key so existing demo data carries over.
  if (email === DEMO_EMAIL) return { email, name: DEFAULT_ME.name, stateKey: STATE_KEY, fresh: seedState };
  const a = readAccounts().find((x) => x.email === email);
  return a ? { email, name: a.name, stateKey: `${STATE_KEY}:${email}`, fresh: () => newUserState(a) } : null;
}

export function currentSession(): Session | null {
  const email = localStorage.getItem(SESSION_KEY);
  return email ? sessionFor(email) : null;
}

function startSession(email: string): Session {
  localStorage.setItem(SESSION_KEY, email);
  window.location.hash = '/dashboard';
  return sessionFor(email)!;
}

export function endSession() {
  localStorage.removeItem(SESSION_KEY);
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({ onAuth }: { onAuth: (s: Session) => void }) {
  const [mode, setMode] = useState<'signin' | 'register'>(() => (readAccounts().length ? 'signin' : 'register'));
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', title: '', department: DEPARTMENTS[0], location: LOCATIONS[0] });
  const [error, setError] = useState('');
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((x) => ({ ...x, [k]: v })); setError(''); };
  const switchMode = (m: typeof mode) => { setMode(m); setError(''); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase();
    const accounts = readAccounts();
    if (mode === 'signin') {
      const a = accounts.find((x) => x.email === email);
      if (!a || a.passHash !== hash(email + ':' + f.password)) return setError('Incorrect email or password.');
      return onAuth(startSession(email));
    }
    if (f.name.trim().length < 2) return setError('Please enter your name.');
    if (!EMAIL_RE.test(email)) return setError('Please enter a valid email address.');
    if (accounts.some((x) => x.email === email)) return setError('An account with this email already exists. Sign in instead.');
    if (f.title.trim().length < 2) return setError('Please enter your role.');
    if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    const account: Account = {
      email, name: f.name.trim(), title: f.title.trim(), department: f.department, location: f.location,
      passHash: hash(email + ':' + f.password), createdAt: Date.now(),
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    onAuth(startSession(email));
  };

  const field = (label: string, input: React.ReactNode, full = true) => <div className={cx(full && 'sm:col-span-2')}><label className="label">{label}</label>{input}</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-3xl animate-popIn overflow-hidden rounded-3xl bg-white shadow-lift md:grid md:grid-cols-[1fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-accent-500 p-8 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <Logo light />
          <h1 className="mt-8 text-3xl font-bold leading-tight">{mode === 'signin' ? 'Welcome back.' : 'Join your colleagues.'}</h1>
          <p className="mt-3 text-white/85">Discover people across teams and offices who share your interests.</p>
          <div className="mt-8 flex items-start gap-2 rounded-xl bg-white/10 p-3 text-xs text-white/90">
            <Icon name="info" className="h-4 w-4 shrink-0" />
            <span>Prototype: accounts are stored only in this browser. No corporate sign-in. Don't reuse a real password.</span>
          </div>
        </div>
        <form onSubmit={submit} className="p-8" noValidate>
          <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
            {([['signin', 'Sign in'], ['register', 'Register']] as const).map(([m, l]) => (
              <button key={m} type="button" onClick={() => switchMode(m)}
                className={cx('flex-1 rounded-lg py-2 text-sm font-semibold transition', mode === m ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900')}>{l}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {mode === 'register' && field('Full name', <input className="input" autoComplete="name" value={f.name} maxLength={60} onChange={(e) => set('name', e.target.value)} />)}
            {field('Email', <input className="input" type="email" autoComplete="email" placeholder="you@mathworks.com" value={f.email} onChange={(e) => set('email', e.target.value)} />)}
            {mode === 'register' && <>
              {field('Role', <input className="input" placeholder="e.g. Software Engineer" value={f.title} maxLength={60} onChange={(e) => set('title', e.target.value)} />)}
              {field('Department', <select className="input" value={f.department} onChange={(e) => set('department', e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>, false)}
              {field('Office', <select className="input" value={f.location} onChange={(e) => set('location', e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select>, false)}
            </>}
            {field('Password', <input className="input" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={f.password} onChange={(e) => set('password', e.target.value)} />, mode === 'signin')}
            {mode === 'register' && field('Confirm password', <input className="input" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => set('confirm', e.target.value)} />, false)}
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <Button type="submit" size="lg" className="mt-5 w-full">{mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
          <div className="my-4 flex items-center gap-3 text-xs text-ink-500"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
          <Button type="button" variant="secondary" className="w-full" onClick={() => onAuth(startSession(DEMO_EMAIL))}>Continue with demo account ({DEFAULT_ME.name})</Button>
        </form>
      </div>
    </div>
  );
}
