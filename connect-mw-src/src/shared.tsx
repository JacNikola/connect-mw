import type { Community, EventItem } from './types';
import { EMPLOYEES } from './data';
import { useStore } from './store';
import { AvatarStack, Button, Icon, cx, fmtDate, fmtTime, parseISO, relativeDay } from './ui';

export const communityById = (communities: Community[], id: string | null) => communities.find((c) => c.id === id);

/**
 * Base members are colleagues whose interests overlap the community's tags, plus the user if joined.
 * Communities the user created start with just the user.
 */
export function useCommunityMembers(c: Community) {
  const { state, employees } = useStore();
  const members = c.leadId === 'me' ? [] : employees.filter((e) => e.interests.some((i) => c.tags.includes(i)));
  const joined = state.joined.includes(c.id);
  return { members, joined, count: members.length + (joined ? 1 : 0) };
}

export function useEventInfo(ev: EventItem) {
  const { state, get } = useStore();
  const registered = state.registered.includes(ev.id);
  const people = ev.attendees.map((id) => EMPLOYEES.find((e) => e.id === id)).filter((x): x is NonNullable<typeof x> => !!x && !state.blocked.includes(x.id));
  const going = ev.attendees.length + (registered ? 1 : 0);
  const host = get(ev.hostId);
  return { registered, people: registered ? [state.me, ...people] : people, going, full: going >= ev.capacity, host, isHost: ev.hostId === 'me' };
}

export function EventCard({ ev, compact = false }: { ev: EventItem; compact?: boolean }) {
  const { state, actions, setModal } = useStore();
  const { registered, people, going, full, isHost } = useEventInfo(ev);
  const comm = communityById(state.communities, ev.communityId);
  const d = parseISO(ev.date);
  const pct = Math.min(100, Math.round((going / ev.capacity) * 100));
  return (
    <div onClick={() => setModal({ type: 'event', id: ev.id })}
      className="group card flex animate-slideUp cursor-pointer gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
      <div className={cx('flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-white bg-gradient-to-br', comm?.gradient ?? 'from-slate-500 to-slate-700')}>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
        <span className="text-xl font-bold leading-tight">{d.getDate()}</span>
        <span className="text-[10px] opacity-90">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          {comm && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-ink-700">{comm.emoji} {comm.name}</span>}
          <span className={cx('rounded-full px-2 py-0.5', ev.mode === 'Virtual' ? 'bg-violet-50 text-violet-700' : ev.mode === 'Hybrid' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700')}>{ev.mode}</span>
          <span className="text-accent-600">{relativeDay(ev.date)}</span>
          {isHost && <span className="rounded-full bg-accent-50 px-2 py-0.5 text-accent-700">You're hosting</span>}
        </div>
        <h3 className="mt-1 truncate font-semibold text-ink-900 group-hover:text-brand-700">{ev.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500">
          <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />{fmtTime(ev.time)}–{fmtTime(ev.endTime)}
          <span className="mx-1">·</span><Icon name="pin" className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{ev.city}</span>
        </p>
        {!compact && <p className="mt-2 line-clamp-2 text-sm text-ink-500">{ev.description}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AvatarStack people={people} max={compact ? 3 : 5} />
            {!compact && (
              <div className="hidden w-24 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cx('h-full rounded-full', full ? 'bg-red-400' : 'bg-brand-500')} style={{ width: pct + '%' }} /></div>
                <p className="mt-0.5 text-[10px] text-ink-500">{going}/{ev.capacity} going</p>
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            {isHost ? <span className="text-xs font-medium text-ink-500">{going} going</span>
              : registered ? <Button size="sm" variant="secondary" icon="check" onClick={() => actions.unregister(ev.id)} title="Click to cancel">Registered</Button>
                : full ? <Button size="sm" variant="secondary" disabled>Full</Button>
                  : <Button size="sm" onClick={() => actions.register(ev.id)}>Register</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export const upcoming = (events: EventItem[]) => {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return events.filter((e) => parseISO(e.date) >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
};

export { fmtDate };
