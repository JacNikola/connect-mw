import { useState } from 'react';
import { useStore } from '../store';
import { upcoming, useCommunityMembers } from '../shared';
import type { Community } from '../types';
import { AvatarStack, Button, EmptyState, Icon, PageHeader, Tabs, cx, relativeDay } from '../ui';

export default function Communities() {
  const { state, setModal } = useStore();
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const { communities } = state;
  const list = tab === 'all' ? communities : communities.filter((c) => state.joined.includes(c.id));
  return (
    <div>
      <PageHeader title="Interest Communities" subtitle="Find your people. Join as many communities as you like, and leave any time."
        action={<Button icon="plus" size="lg" onClick={() => setModal({ type: 'createCommunity' })}>Create community</Button>} />
      <div className="mb-6"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All communities', count: communities.length }, { id: 'mine', label: 'Joined', count: state.joined.length }]} /></div>
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{list.map((c, i) => <CommunityCard key={c.id} c={c} delay={i * 40} />)}</div>
      ) : <EmptyState emoji="🌱" title="You haven't joined any communities yet" text="Communities are a relaxed way to meet people who enjoy the same things." action={<Button onClick={() => setTab('all')}>Browse communities</Button>} />}
    </div>
  );
}

function CommunityCard({ c, delay }: { c: Community; delay: number }) {
  const { state, actions, setModal } = useStore();
  const { members, joined, count } = useCommunityMembers(c);
  const next = upcoming(state.events.filter((e) => e.communityId === c.id))[0];
  const match = c.tags.some((t) => state.me.interests.includes(t));
  return (
    <div style={{ animationDelay: `${delay}ms` }} onClick={() => setModal({ type: 'community', id: c.id })}
      className="group card flex animate-slideUp cursor-pointer flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className={cx('relative h-28 bg-gradient-to-br p-4 text-white', c.gradient)}>
        <span className="absolute -bottom-3 right-3 text-7xl opacity-25 transition group-hover:scale-110">{c.emoji}</span>
        <span className="text-3xl">{c.emoji}</span>
        {match && <span className="absolute right-3 top-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">Matches you</span>}
        {joined && <span className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700"><Icon name="check" className="h-3 w-3" />Joined</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-ink-900 group-hover:text-brand-700">{c.name}</h3>
        <p className="text-xs text-ink-500">{c.tagline}</p>
        <p className="mt-2 line-clamp-2 text-sm text-ink-700">{c.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <AvatarStack people={joined ? [state.me, ...members] : members} max={4} />
          <span className="text-xs font-medium text-ink-500">{count} members</span>
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
          {next ? <><span className="font-semibold text-accent-600">{relativeDay(next.date)}:</span> <span className="text-ink-700">{next.title}</span></>
            : <span className="text-ink-500"><Icon name="clock" className="mr-1 inline h-3 w-3 -translate-y-px" />{c.schedule}</span>}
        </div>
        <div className="mt-auto pt-4" onClick={(e) => e.stopPropagation()}>
          {joined ? <Button variant="secondary" size="sm" className="w-full" onClick={() => actions.leave(c.id)}>Leave</Button>
            : <Button size="sm" icon="plus" className="w-full" onClick={() => actions.join(c.id)}>Join</Button>}
        </div>
      </div>
    </div>
  );
}
