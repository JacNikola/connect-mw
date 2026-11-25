import { useMemo, useState } from 'react';
import { INTEREST_EMOJI, todayISO } from '../data';
import { matchScore, useStore } from '../store';
import { EventCard, upcoming, useCommunityMembers } from '../shared';
import type { Community } from '../types';
import { Avatar, Button, EmptyState, Icon, LinkButton, PersonCard, SectionTitle, cx, fmtDate, fmtTime } from '../ui';

export default function Dashboard() {
  const { state, employees, status, navigate, setModal, actions } = useStore();
  const { me, settings } = state;
  const [scope, setScope] = useState<'all' | 'office'>('all');
  const first = me.name.split(' ')[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const recommended = useMemo(() => employees
    .filter((e) => status(e.id) === 'none' && (scope === 'all' || e.location === me.location))
    .map((e) => ({ e, ...matchScore(me.interests, e.interests) }))
    .filter((x) => x.shared.length > 0)
    .sort((a, b) => b.pct - a.pct || a.e.name.localeCompare(b.e.name))
    .slice(0, 6), [employees, status, scope, me]);

  const incoming = employees.filter((e) => status(e.id) === 'incoming');
  const connections = Object.values(state.connections).filter((c) => c.status === 'connected').length;
  const events = upcoming(state.events).slice(0, 3);
  const myEvents = upcoming(state.events).filter((e) => state.registered.includes(e.id)).length;
  const suggested = state.communities.filter((c) => !state.joined.includes(c.id))
    .map((c) => ({ c, overlap: c.tags.filter((t) => me.interests.includes(t)).length }))
    .sort((a, b) => b.overlap - a.overlap).slice(0, 3).map((x) => x.c);
  const interestCounts = me.interests.map((i) => ({ i, n: employees.filter((e) => e.interests.includes(i)).length })).sort((a, b) => b.n - a.n);
  const nextCoffee = [...state.coffee].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 p-6 text-white shadow-lift sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-brand-100">{fmtDate(todayISO(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{greet}, {first} 👋</h1>
            <p className="mt-2 text-brand-50/90">
              {recommended.length > 0 ? <>We found <b className="text-white">{recommended.length} colleagues</b> who share your interests. Who will you meet this week?</> : 'Connecting people beyond work. Explore who’s around.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="accent" icon="sparkles" size="lg" onClick={() => setModal({ type: 'surprise' })}>Surprise Connect</Button>
              <Button variant="secondary" icon="search" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('discover')}>Discover people</Button>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <Stat label="Connections" value={connections} onClick={() => navigate('connections')} />
            <Stat label="Pending requests" value={incoming.length} highlight onClick={() => navigate('connections?tab=requests')} />
            <Stat label="Communities" value={state.joined.length} onClick={() => navigate('communities')} />
            <Stat label="My events" value={myEvents} onClick={() => navigate('events?tab=registered')} />
          </div>
        </div>
      </section>

      {!settings.participating && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3"><Icon name="eye" className="mt-0.5 h-5 w-5 text-amber-700" />
            <div><p className="font-semibold text-amber-900">You're browsing privately</p><p className="text-sm text-amber-800">Your profile is hidden. Opt in whenever you're ready to connect. It's completely voluntary.</p></div></div>
          <Button onClick={() => { actions.updateSettings({ participating: true }); navigate('profile'); }}>Opt in</Button>
        </div>
      )}
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Upcoming */}
          <section>
            <SectionTitle title="Upcoming activities" icon="calendar" action={<LinkButton onClick={() => navigate('events')}>All events</LinkButton>} />
            {events.length ? <div className="grid gap-3 lg:grid-cols-1">{events.map((e) => <EventCard key={e.id} ev={e} />)}</div>
              : <EmptyState emoji="📅" title="Nothing scheduled" text="Be the first to organise something!" action={<Button icon="plus" onClick={() => setModal({ type: 'createEvent' })}>Create event</Button>} />}
          </section>

          {/* Recommended */}
          <section>
            <SectionTitle title="Recommended for you" icon="sparkles" action={
              <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-card">
                {(['all', 'office'] as const).map((s) => (
                  <button key={s} onClick={() => setScope(s)} className={cx('rounded-lg px-3 py-1 text-xs font-semibold transition', scope === s ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900')}>
                    {s === 'all' ? 'All offices' : me.location}
                  </button>
                ))}
              </div>
            } />
            {recommended.length ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{recommended.map((r, i) => <PersonCard key={r.e.id} person={r.e} delay={i * 40} />)}</div>
            ) : <EmptyState emoji="🔍" title="No new matches here" text={scope === 'office' ? `Try "All offices" or add more interests to your profile.` : 'Add more interests to your profile to discover more people.'}
              action={<Button variant="secondary" onClick={() => navigate('profile')}>Edit interests</Button>} />}
            <div className="mt-3 flex justify-end"><LinkButton onClick={() => navigate('discover')}>See everyone</LinkButton></div>
          </section>

          {/* Common interests */}
          <section className="card p-5">
            <SectionTitle title="Your interests across MathWorks" icon="heart" action={<LinkButton onClick={() => navigate('profile')}>Edit</LinkButton>} />
            {interestCounts.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {interestCounts.map(({ i, n }) => (
                  <button key={i} onClick={() => navigate(`discover?interest=${encodeURIComponent(i)}`)}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">{INTEREST_EMOJI[i]}</span>
                    <span className="flex-1"><span className="block text-sm font-semibold">{i}</span><span className="text-xs text-ink-500">{n} colleague{n === 1 ? '' : 's'}</span></span>
                    <Icon name="arrowRight" className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-ink-500">You haven't added interests yet.</p>}
          </section>
        </div>

        <aside className="space-y-6">
          {/* Coffee Connect */}
          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lift">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90"><Icon name="coffee" className="h-4 w-4" />Coffee Connect</div>
            {nextCoffee ? (() => {
              const w = employees.find((e) => e.id === nextCoffee.withId);
              return w ? (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/15 p-3 backdrop-blur">
                  <Avatar person={w} size="sm" />
                  <div className="min-w-0 text-sm"><p className="font-semibold">Next: {w.name}</p><p className="truncate opacity-90">{fmtDate(nextCoffee.date)} · {fmtTime(nextCoffee.time)} · {nextCoffee.status === 'confirmed' ? 'Confirmed' : 'Awaiting reply'}</p></div>
                </div>
              ) : null;
            })() : <p className="mt-2 text-sm opacity-90">No coffee chats planned yet. A 20-minute chat is the easiest way to meet someone new.</p>}
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 border-0" onClick={() => navigate('connections?tab=coffee')}>My coffee chats</Button>
              <Button variant="secondary" size="sm" className="flex-1 border-0" icon="sparkles" onClick={() => setModal({ type: 'surprise' })}>Surprise me</Button>
            </div>
          </section>

          {/* Suggested communities */}
          <section className="card p-5">
            <SectionTitle title="Suggested communities" icon="users" action={<LinkButton onClick={() => navigate('communities')}>All</LinkButton>} />
            {suggested.length ? <div className="space-y-2">{suggested.map((c) => <MiniCommunity key={c.id} c={c} />)}</div>
              : <p className="text-sm text-ink-500">You've joined every community. Amazing! 🎉</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, onClick, highlight }: { label: string; value: number; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} className={cx('min-w-[130px] rounded-2xl border px-4 py-3 text-left backdrop-blur transition',
      highlight ? 'border-yellow-200 bg-yellow-100 text-amber-900 hover:bg-yellow-50' : 'border-white/15 bg-white/10 hover:bg-white/20')}>
      <p className="text-2xl font-bold">{value}</p><p className={cx('text-xs', highlight ? 'text-amber-800' : 'text-brand-50/90')}>{label}</p>
    </button>
  );
}

function MiniCommunity({ c }: { c: Community }) {
  const { actions, setModal } = useStore();
  const { count } = useCommunityMembers(c);
  return (
    <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
      <button onClick={() => setModal({ type: 'community', id: c.id })} className="flex flex-1 items-center gap-3 text-left">
        <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xl', c.gradient)}>{c.emoji}</span>
        <span><span className="block text-sm font-semibold">{c.name}</span><span className="text-xs text-ink-500">{count} members</span></span>
      </button>
      <Button size="sm" variant="secondary" icon="plus" onClick={() => actions.join(c.id)}>Join</Button>
    </div>
  );
}
