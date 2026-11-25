import { useCallback, useState } from 'react';
import { StoreProvider, profileCompleteness, useStore } from './store';
import { AuthScreen, currentSession, endSession, type Session } from './auth';
import { Modals } from './modals';
import { Avatar, Button, Icon, Logo, Modal, ProgressRing, cx, type IconName } from './ui';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Connections from './pages/Connections';
import Communities from './pages/Communities';
import Events from './pages/Events';
import Profile from './pages/Profile';

const NAV: { id: string; label: string; short: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: 'home' },
  { id: 'discover', label: 'Discover People', short: 'Discover', icon: 'search' },
  { id: 'connections', label: 'My Connections', short: 'Connect', icon: 'users' },
  { id: 'communities', label: 'Communities', short: 'Groups', icon: 'grid' },
  { id: 'events', label: 'Events', short: 'Events', icon: 'calendar' },
  { id: 'profile', label: 'My Profile', short: 'Profile', icon: 'user' },
];

function PrototypeBadge() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800 transition hover:bg-amber-100">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />Prototype<span className="hidden sm:inline"> · Demo data</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" title="This is a concept prototype"
        footer={<Button onClick={() => setOpen(false)}>Got it</Button>}>
        <ul className="space-y-2 p-6 text-sm text-ink-700">
          <li>• Every person, event and message is <b>fictional</b>.</li>
          <li>• There is <b>no corporate sign-in</b> and <b>no Microsoft Teams, Outlook or HR integration</b>.</li>
          <li>• Your changes live only in this browser's local storage.</li>
          <li>• Colleague responses are simulated to demonstrate the flow.</li>
        </ul>
      </Modal>
    </>
  );
}

function Shell() {
  const { route, navigate, state, unseenRequests: pending, actions, toasts, dismissToast, setModal } = useStore();
  const page = NAV.some((n) => n.id === route.page) ? route.page : 'dashboard';
  const badge = (id: string) => (id === 'connections' && pending > 0 ? pending : 0);
  const completeness = profileCompleteness(state.me);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <button onClick={() => navigate('dashboard')} className="px-2 text-left"><Logo /></button>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => navigate(n.id)}
              className={cx('group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                page === n.id ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-slate-50 hover:text-ink-900')}>
              <Icon name={n.icon} className={cx('h-5 w-5', page === n.id ? 'text-brand-600' : 'text-ink-300 group-hover:text-ink-500')} />
              <span className="flex-1 text-left">{n.label}</span>
              {badge(n.id) > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[11px] font-bold text-white">{badge(n.id)}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setModal({ type: 'surprise' })} className="mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-brand-600 p-4 text-left text-white shadow-lift transition hover:brightness-110">
          <Icon name="sparkles" className="h-5 w-5" />
          <p className="mt-2 text-sm font-bold">Surprise Connect</p>
          <p className="text-xs text-white/80">Meet someone outside your team</p>
        </button>
        <button onClick={() => navigate('profile')} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition hover:bg-slate-50"
          aria-label={`My profile, ${completeness}% complete`}>
          <Avatar person={state.me} size="sm" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{state.me.name}</p><p className="truncate text-xs text-ink-500">{state.settings.participating ? 'Profile visible' : 'Browsing privately'}</p></div>
          <ProgressRing pct={completeness} />
        </button>
        <button onClick={actions.logout} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-slate-50 hover:text-red-600">
          <Icon name="logout" className="h-4 w-4" />Log out
        </button>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur lg:ml-64">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('dashboard')} className="lg:hidden"><Logo /></button>
          <p className="hidden text-sm text-ink-500 lg:block">{NAV.find((n) => n.id === page)?.label}</p>
          <div className="flex items-center gap-2">
            <PrototypeBadge />
            <button onClick={() => { actions.markRequestsSeen(); navigate('connections?tab=requests'); }} className="relative rounded-full p-2 text-ink-500 transition hover:bg-slate-100" aria-label={`${pending} new requests`}>
              <Icon name="bell" />
              {pending > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">{pending}</span>}
            </button>
            <button onClick={() => navigate('profile')} className="hidden sm:block lg:hidden" aria-label="My profile"><Avatar person={state.me} size="sm" /></button>
            <button onClick={actions.logout} className="rounded-full p-2 text-ink-500 transition hover:bg-slate-100 hover:text-red-600 lg:hidden" aria-label="Log out"><Icon name="logout" /></button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-8 lg:pb-12">
        <div key={page} className="mx-auto max-w-7xl animate-fadeIn">
          {page === 'dashboard' && <Dashboard />}
          {page === 'discover' && <Discover />}
          {page === 'connections' && <Connections />}
          {page === 'communities' && <Communities />}
          {page === 'events' && <Events />}
          {page === 'profile' && <Profile />}
        </div>
        <footer className="mx-auto mt-12 max-w-7xl border-t border-slate-200 pt-6 text-center text-xs text-ink-500">
          Connect@MW concept prototype · Fictional data only · Participation is voluntary and connections require mutual consent.
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => navigate(n.id)} className={cx('relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold', page === n.id ? 'text-brand-600' : 'text-ink-500')}>
            <Icon name={n.icon} className="h-5 w-5" />{n.short}
            {badge(n.id) > 0 && <span className="absolute right-[22%] top-1 h-2 w-2 rounded-full bg-accent-500" />}
          </button>
        ))}
      </nav>

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
        {toasts.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto flex w-full max-w-sm animate-slideUp items-start gap-3 rounded-2xl px-4 py-3 text-sm text-white shadow-lift',
            t.kind === 'success' ? 'bg-emerald-600' : t.kind === 'error' ? 'bg-red-600' : 'bg-ink-900')}>
            <Icon name={t.kind === 'success' ? 'check' : t.kind === 'error' ? 'info' : 'bell'} className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{t.text}</span>
            <button onClick={() => dismissToast(t.id)} className="opacity-70 hover:opacity-100" aria-label="Dismiss"><Icon name="x" className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <Modals />
      {!state.onboarded && <Onboarding />}
    </div>
  );
}

function Onboarding() {
  const { actions, navigate, state } = useStore();
  const [agree, setAgree] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl animate-popIn overflow-hidden rounded-3xl bg-white shadow-lift md:grid md:grid-cols-[1fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-accent-500 p-8 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <Logo light />
          <h1 className="mt-8 text-3xl font-bold leading-tight">Meet the people behind the work.</h1>
          <p className="mt-3 text-white/85">Discover colleagues across teams and offices who share your interests, from badminton to board games.</p>
          <div className="mt-8 space-y-3 text-sm">
            {[['sparkles', 'Smart interest-based matches'], ['coffee', 'Easy, informal coffee chats'], ['users', 'Communities & activities']].map(([i, t]) => (
              <div key={t} className="flex items-center gap-3"><span className="rounded-lg bg-white/15 p-1.5"><Icon name={i as IconName} className="h-4 w-4" /></span>{t}</div>
            ))}
          </div>
        </div>
        <div className="p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">Concept prototype</span>
          <h2 className="mt-3 text-xl font-bold">Welcome, {state.me.name.split(' ')[0]}!</h2>
          <p className="mt-1 text-sm text-ink-500">Before you start, here's how Connect@MW respects your privacy:</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
            {['Participation is completely voluntary. You can browse privately.', 'Your profile appears only if you opt in, and you can hide it any time.', 'Connections need mutual consent. Block or report anyone, any time.', 'We only ask for work-appropriate info. No sensitive personal data.', 'Demo only: fictional data, stored in your browser. No corporate sign-in or Teams integration.'].map((t) => (
              <li key={t} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t}</li>
            ))}
          </ul>
          <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I'd like to <b>opt in</b> and make my profile visible to colleagues who have also opted in.</span>
          </label>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="flex-1" disabled={!agree} onClick={() => { actions.finishOnboarding(true); navigate('dashboard'); }}>Opt in & get started</Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={() => actions.finishOnboarding(false)}>Just browse</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(currentSession);
  const logout = useCallback(() => { endSession(); setSession(null); }, []);
  if (!session) return <AuthScreen onAuth={setSession} />;
  // Keyed by account so switching users reloads that user's saved state.
  return <StoreProvider key={session.email} session={session} onLogout={logout}><Shell /></StoreProvider>;
}
