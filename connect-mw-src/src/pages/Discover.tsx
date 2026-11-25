import { useEffect, useMemo, useState } from 'react';
import { DEPARTMENTS, INTEREST_GROUPS, LOCATIONS } from '../data';
import { matchScore, useStore } from '../store';
import { Button, Chip, EmptyState, Icon, PageHeader, PersonCard, cx } from '../ui';

type Sort = 'match' | 'name' | 'newest';

export default function Discover() {
  const { state, employees, route } = useStore();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [loc, setLoc] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [sharedOnly, setSharedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('match');
  const [showAll, setShowAll] = useState(false);

  // Allow deep links like #/discover?interest=Badminton
  useEffect(() => {
    const i = route.params.get('interest');
    if (i) { setInterests([i]); setShowAll(true); }
  }, [route]);

  const toggle = (i: string) => setInterests((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i]));
  const clear = () => { setQ(''); setDept(''); setLoc(''); setInterests([]); setSharedOnly(false); };
  const active = !!(q || dept || loc || interests.length || sharedOnly);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return employees
      .map((e) => ({ e, ...matchScore(state.me.interests, e.interests) }))
      .filter(({ e, shared }) =>
        (!needle || [e.name, e.title, e.department, e.team, e.location, e.bio, ...e.interests].join(' ').toLowerCase().includes(needle)) &&
        (!dept || e.department === dept) &&
        (!loc || e.location === loc) &&
        (!interests.length || interests.some((i) => e.interests.includes(i))) &&
        (!sharedOnly || shared.length > 0))
      .sort((a, b) => sort === 'name' ? a.e.name.localeCompare(b.e.name) : sort === 'newest' ? b.e.joined - a.e.joined : b.pct - a.pct || a.e.name.localeCompare(b.e.name));
  }, [employees, state.me.interests, q, dept, loc, interests, sharedOnly, sort]);

  const quick = INTEREST_GROUPS.flatMap((g) => g.items).filter((i) => state.me.interests.includes(i));
  return (
    <div>
      <PageHeader title="Discover People" subtitle="Find colleagues across teams and offices who share your interests." />

      <div className="card sticky top-[68px] z-20 mb-6 space-y-4 p-4 lg:top-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input className="input pl-10" placeholder="Search by name, team, interest or keyword…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search people" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 hover:bg-slate-100" aria-label="Clear search"><Icon name="x" className="h-4 w-4" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <select className="input md:w-52" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
              <option value="">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="input md:w-44" value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Office location">
              <option value="">All locations</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500"><Icon name="filter" className="h-3.5 w-3.5" />Interests</span>
            {(showAll ? INTEREST_GROUPS.flatMap((g) => g.items) : [...new Set([...quick, ...interests])]).map((i) => (
              <Chip key={i} label={i} active={interests.includes(i)} onClick={() => toggle(i)} size="sm" />
            ))}
            <button onClick={() => setShowAll(!showAll)} className="px-2 text-xs font-semibold text-brand-600 hover:text-brand-800">{showAll ? 'Show fewer' : 'All interests…'}</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" checked={sharedOnly} onChange={(e) => setSharedOnly(e.target.checked)} />
              Shared interests only
            </label>
            {active && <button onClick={clear} className="text-sm font-semibold text-accent-600 hover:text-accent-700">Clear all filters</button>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500"><b className="text-ink-900">{results.length}</b> {results.length === 1 ? 'person' : 'people'}</span>
            <span className="text-ink-300">|</span>
            <span className="text-ink-500">Sort</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {([['match', 'Best match'], ['name', 'A–Z'], ['newest', 'Newest']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)} className={cx('rounded-md px-2.5 py-1 text-xs font-semibold transition', sort === k ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500')}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((r, i) => <PersonCard key={r.e.id} person={r.e} delay={Math.min(i, 12) * 25} />)}
        </div>
      ) : (
        <EmptyState emoji="🧭" title="No colleagues match those filters" text="Try removing a filter or searching for a different interest." action={<Button variant="secondary" icon="refresh" onClick={clear}>Reset filters</Button>} />
      )}
      <p className="mt-8 text-center text-xs text-ink-500">Only colleagues who've opted in are shown. Match % = 2 × shared interests ÷ (your interests + theirs).</p>
    </div>
  );
}
