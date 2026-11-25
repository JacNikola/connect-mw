import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { EventCard, upcoming } from '../shared';
import { Button, EmptyState, PageHeader, Tabs } from '../ui';

type Tab = 'upcoming' | 'registered' | 'hosting';

export default function Events() {
  const { state, route, setModal } = useStore();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [comm, setComm] = useState('');
  const [city, setCity] = useState('');
  useEffect(() => { const t = route.params.get('tab') as Tab | null; if (t) setTab(t); }, [route]);

  const all = upcoming(state.events);
  const base = tab === 'registered' ? all.filter((e) => state.registered.includes(e.id) && e.hostId !== 'me') : tab === 'hosting' ? all.filter((e) => e.hostId === 'me') : all;
  const list = base.filter((e) => (!comm || (comm === 'open' ? e.communityId === null : e.communityId === comm)) && (!city || e.city === city));
  const cities = [...new Set(state.events.map((e) => e.city))].sort();

  // Group by week label for scanability
  const groups: { label: string; items: typeof list }[] = [];
  list.forEach((e) => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const [y, m, d] = e.date.split('-').map(Number);
    const diff = Math.round((new Date(y, m - 1, d).getTime() - t.getTime()) / 86400e3);
    const label = diff < 7 ? 'This week' : diff < 14 ? 'Next week' : 'Later';
    const g = groups.find((x) => x.label === label);
    if (g) { g.items.push(e); } else { groups.push({ label, items: [e] }); }
  });

  return (
    <div>
      <PageHeader title="Events & Activities" subtitle="Treks, game nights, jam sessions and more, organised by colleagues."
        action={<Button icon="plus" size="lg" onClick={() => setModal({ type: 'createEvent' })}>Create event</Button>} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'upcoming', label: 'All upcoming', count: all.length },
          { id: 'registered', label: 'Registered', count: all.filter((e) => state.registered.includes(e.id) && e.hostId !== 'me').length },
          { id: 'hosting', label: 'Hosting', count: all.filter((e) => e.hostId === 'me').length },
        ]} />
        <div className="flex gap-2">
          <select className="input w-auto py-2" value={comm} onChange={(e) => setComm(e.target.value)} aria-label="Community">
            <option value="">All communities</option><option value="open">Open to everyone</option>
            {state.communities.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <select className="input w-auto py-2" value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
            <option value="">All locations</option>{cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {list.length ? (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-500">{g.label}</h2>
              <div className="grid gap-4 lg:grid-cols-2">{g.items.map((e) => <EventCard key={e.id} ev={e} />)}</div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState emoji={tab === 'hosting' ? '🎤' : '📅'}
          title={tab === 'hosting' ? "You're not hosting anything yet" : tab === 'registered' ? 'No registrations yet' : 'No events match your filters'}
          text={tab === 'hosting' ? 'Start something! A walk, a game night, a lunch-and-learn. Small events are great too.' : tab === 'registered' ? 'Browse upcoming activities and register for one that sounds fun.' : 'Try a different community or location.'}
          action={tab === 'hosting' ? <Button icon="plus" onClick={() => setModal({ type: 'createEvent' })}>Create event</Button>
            : <Button variant="secondary" onClick={() => { setTab('upcoming'); setComm(''); setCity(''); }}>Show all events</Button>} />
      )}
    </div>
  );
}
