import { useEffect, useState } from 'react';
import { conversationStarters } from '../data';
import { matchScore, useStore } from '../store';
import type { Employee } from '../types';
import { Avatar, Button, Chip, EmptyState, Icon, PageHeader, Tabs, cx, fmtDate, fmtTime, relativeDay, timeAgo } from '../ui';

type Tab = 'connected' | 'requests' | 'sent' | 'coffee';

export default function Connections() {
  const { state, employees, status, route, navigate, setModal, actions } = useStore();
  const routeTab = (route.params.get('tab') as Tab | null) ?? 'connected';
  const [tab, setTab] = useState<Tab>(routeTab);
  useEffect(() => setTab(routeTab), [routeTab]);
  // Opening the Requests tab counts as seeing them, which clears the bell badge.
  useEffect(() => { if (tab === 'requests') actions.markRequestsSeen(); }, [tab, actions]);
  const by = (s: string) => employees.filter((e) => status(e.id) === s).sort((a, b) => state.connections[b.id].at - state.connections[a.id].at);
  const connected = by('connected'), incoming = by('incoming'), sent = by('outgoing');
  const coffee = state.coffee.filter((c) => employees.some((e) => e.id === c.withId)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const change = (t: Tab) => { setTab(t); navigate(`connections?tab=${t}`); };

  return (
    <div>
      <PageHeader title="My Connections" subtitle="Connections are always mutual. Both people have to agree." action={
        <Button variant="accent" icon="sparkles" onClick={() => setModal({ type: 'surprise' })}>Surprise Connect</Button>} />
      <div className="mb-6">
        <Tabs value={tab} onChange={change} tabs={[
          { id: 'connected', label: 'Connected', count: connected.length },
          { id: 'requests', label: 'Requests', count: incoming.length },
          { id: 'sent', label: 'Sent', count: sent.length },
          { id: 'coffee', label: '☕ Coffee chats', count: coffee.length },
        ]} />
      </div>

      {tab === 'connected' && (connected.length ? (
        <div className="grid gap-4 md:grid-cols-2">{connected.map((p) => <ConnectedCard key={p.id} p={p} />)}</div>
      ) : <EmptyState emoji="🤝" title="No connections yet" text="Discover colleagues with shared interests and send your first request." action={<Button icon="search" onClick={() => navigate('discover')}>Discover people</Button>} />)}

      {tab === 'requests' && (incoming.length ? (
        <div className="grid gap-4 md:grid-cols-2">{incoming.map((p) => <RequestCard key={p.id} p={p} kind="incoming" />)}</div>
      ) : <EmptyState emoji="📭" title="No pending requests" text="When someone wants to connect, you'll see it here. You can always decline." />)}

      {tab === 'sent' && (sent.length ? (
        <div className="grid gap-4 md:grid-cols-2">{sent.map((p) => <RequestCard key={p.id} p={p} kind="outgoing" />)}</div>
      ) : <EmptyState emoji="✉️" title="No requests waiting" text="Requests you send will show here until the other person responds." />)}

      {tab === 'coffee' && (coffee.length ? (
        <div className="space-y-3">{coffee.map((c) => <CoffeeRow key={c.id} id={c.id} />)}</div>
      ) : <EmptyState emoji="☕" title="No coffee chats planned" text={connected.length ? 'Pick a connection and suggest a quick, informal chat.' : 'Connect with someone first, then plan a coffee chat.'}
        action={connected.length ? <Button variant="accent" icon="coffee" onClick={() => change('connected')}>Choose a connection</Button> : <Button icon="search" onClick={() => navigate('discover')}>Discover people</Button>} />)}
    </div>
  );
}

function PersonHeader({ p, sub }: { p: Employee; sub?: string }) {
  const { setModal } = useStore();
  return (
    <button className="flex w-full items-center gap-3 text-left" onClick={() => setModal({ type: 'profile', id: p.id })}>
      <Avatar person={p} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold hover:text-brand-700">{p.name}</p>
        <p className="truncate text-xs text-ink-500">{p.title} · {p.department}</p>
        <p className="truncate text-xs text-ink-500"><Icon name="pin" className="mr-0.5 inline h-3 w-3 -translate-y-px" />{p.location}{sub && ` · ${sub}`}</p>
      </div>
    </button>
  );
}

function ConnectedCard({ p }: { p: Employee }) {
  const { state, setModal, actions } = useStore();
  const { shared } = matchScore(state.me.interests, p.interests);
  const [open, setOpen] = useState(false);
  const starters = conversationStarters(shared, p);
  return (
    <div className="card animate-slideUp p-5">
      <PersonHeader p={p} sub={`connected ${timeAgo(state.connections[p.id].at)}`} />
      {shared.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{shared.map((s) => <Chip key={s} label={s} shared size="sm" />)}</div>}
      <button onClick={() => setOpen(!open)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600">
        <Icon name="message" className="h-3.5 w-3.5" />{open ? 'Hide' : 'Show'} conversation starters
      </button>
      {open && <ul className="mt-2 animate-fadeIn space-y-1.5">{starters.map((s) => <li key={s} className="rounded-lg bg-accent-50 px-3 py-2 text-xs text-ink-700">“{s}”</li>)}</ul>}
      <div className="mt-4 flex gap-2">
        <Button variant="accent" size="sm" icon="coffee" className="flex-1" onClick={() => setModal({ type: 'coffee', id: p.id })}>Plan coffee</Button>
        <Button variant="secondary" size="sm" onClick={() => setModal({ type: 'profile', id: p.id })}>Profile</Button>
        <Button variant="ghost" size="sm" onClick={() => actions.removeConnection(p.id)} title="Remove connection"><Icon name="x" className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function RequestCard({ p, kind }: { p: Employee; kind: 'incoming' | 'outgoing' }) {
  const { state, actions } = useStore();
  const c = state.connections[p.id];
  const { shared } = matchScore(state.me.interests, p.interests);
  return (
    <div className={cx('card animate-slideUp p-5', kind === 'incoming' && 'border-l-4 border-l-accent-400')}>
      <PersonHeader p={p} sub={timeAgo(c.at)} />
      {c.surprise && <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700"><Icon name="sparkles" className="h-3 w-3" />Surprise Connect</span>}
      {c.note && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm italic text-ink-700">“{c.note}”</p>}
      {shared.length > 0 && <p className="mt-2 text-xs text-ink-500"><b className="text-accent-600">{shared.length} shared:</b> {shared.join(', ')}</p>}
      <div className="mt-4 flex gap-2">
        {kind === 'incoming' ? <>
          <Button variant="success" size="sm" icon="check" className="flex-1" onClick={() => actions.accept(p.id)}>Accept</Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => actions.decline(p.id)}>Decline</Button>
        </> : <>
          <span className="flex flex-1 items-center gap-1.5 text-xs font-medium text-amber-700"><Icon name="clock" className="h-3.5 w-3.5" />Awaiting response</span>
          <Button variant="secondary" size="sm" onClick={() => actions.withdraw(p.id)}>Withdraw</Button>
        </>}
      </div>
    </div>
  );
}

function CoffeeRow({ id }: { id: string }) {
  const { state, get, actions, setModal } = useStore();
  const c = state.coffee.find((x) => x.id === id)!;
  const p = get(c.withId)!;
  return (
    <div className="card flex animate-slideUp flex-wrap items-center gap-4 p-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white">
        <span className="text-lg">☕</span><span className="text-[10px] font-bold">{fmtTime(c.time)}</span>
      </div>
      <button onClick={() => setModal({ type: 'profile', id: p.id })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Avatar person={p} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">Coffee with {p.name}</p>
          <p className="truncate text-xs text-ink-500">{relativeDay(c.date)} · {fmtDate(c.date)} · {c.mode === 'Virtual' ? '💻 Video call' : `🏢 ${c.place}`}</p>
          {c.note && <p className="truncate text-xs text-ink-500">Topic: {c.note}</p>}
        </div>
      </button>
      <span className={cx('rounded-full px-2.5 py-1 text-xs font-semibold', c.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
        {c.status === 'confirmed' ? '✓ Confirmed' : 'Awaiting reply'}
      </span>
      <Button variant="ghost" size="sm" icon="trash" onClick={() => actions.cancelCoffee(c.id)}>Cancel</Button>
    </div>
  );
}
