import { useEffect, useMemo, useState } from 'react';
import type { Community, EventItem, EventMode } from './types';
import { COMMUNITY_EMOJIS, COMMUNITY_GRADIENTS, INTEREST_GROUPS, LOCATIONS, conversationStarters, isoDate, meetingPlaces, todayISO } from './data';
import { matchScore, useStore } from './store';
import { communityById, EventCard, upcoming, useCommunityMembers, useEventInfo } from './shared';
import { Avatar, AvatarStack, Button, Chip, ConnectAction, Icon, MatchRing, Modal, cx, fmtDate, fmtTime, timeAgo } from './ui';

export function Modals() {
  const { modal, setModal } = useStore();
  const close = () => setModal(null);
  if (!modal) return null;
  switch (modal.type) {
    case 'profile': return <ProfileModal id={modal.id} onClose={close} />;
    case 'connect': return <ConnectModal id={modal.id} surprise={modal.surprise} onClose={close} />;
    case 'coffee': return <CoffeeModal id={modal.id} onClose={close} />;
    case 'report': return <ReportModal id={modal.id} onClose={close} />;
    case 'block': return <BlockModal id={modal.id} onClose={close} />;
    case 'community': return <CommunityModal id={modal.id} onClose={close} />;
    case 'event': return <EventModal id={modal.id} onClose={close} />;
    case 'createEvent': return <CreateEventModal onClose={close} />;
    case 'createCommunity': return <CreateCommunityModal onClose={close} />;
    case 'surprise': return <SurpriseModal onClose={close} />;
    case 'optin': return <OptInModal onClose={close} />;
  }
}

/* ------------------------------ Profile modal ----------------------------- */
function ProfileModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { get, state, status, setModal, actions } = useStore();
  const p = get(id);
  const [menu, setMenu] = useState(false);
  if (!p) return null;
  const { shared, pct } = matchScore(state.me.interests, p.interests);
  const st = status(id);
  const conn = state.connections[id];
  const starters = conversationStarters(shared, p);
  const communities = state.communities.filter((c) => c.leadId !== 'me' && c.tags.some((t) => p.interests.includes(t)));
  return (
    <Modal open onClose={onClose} size="lg">
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" />
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30" aria-label="Close"><Icon name="x" /></button>
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <Avatar person={p} size="xl" ring />
            <div className="flex items-center gap-2">
              <ConnectAction person={p} size="md" />
              <div className="relative">
                <Button variant="secondary" size="md" onClick={() => setMenu(!menu)} aria-label="More options" className="px-2.5"><Icon name="more" /></Button>
                {menu && (
                  <div className="absolute right-0 z-10 mt-2 w-48 animate-popIn overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift">
                    {st === 'connected' && <MenuItem icon="x" label="Remove connection" onClick={() => { setModal(null); actions.removeConnection(id); }} />}
                    <MenuItem icon="flag" label="Report" onClick={() => setModal({ type: 'report', id })} />
                    <MenuItem icon="ban" label="Block" danger onClick={() => setModal({ type: 'block', id })} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink-900">{p.name}</h2>
              <p className="text-ink-700">{p.title} · {p.team}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                <span className="flex items-center gap-1"><Icon name="building" className="h-4 w-4" />{p.department}</span>
                <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{p.location}</span>
                <span className="flex items-center gap-1"><Icon name="calendar" className="h-4 w-4" />Since {p.joined}</span>
              </div>
            </div>
            <MatchRing pct={pct} size={64} />
          </div>

          {st === 'incoming' && conn?.note && <Note label={`${p.name.split(' ')[0]} wrote (${timeAgo(conn.at)})`} text={conn.note} />}
          {st === 'connected' && <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800"><Icon name="check" className="h-4 w-4" />You're connected · since {timeAgo(conn!.at)}</div>}
          {st === 'outgoing' && <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800"><Icon name="clock" className="h-4 w-4" />Request pending. Waiting for {p.name.split(' ')[0]} to accept.</div>}

          <p className="mt-4 leading-relaxed text-ink-700">{p.bio}</p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="label">Interests & hobbies</h3>
              <div className="flex flex-wrap gap-1.5">{p.interests.map((i) => <Chip key={i} label={i} shared={shared.includes(i)} />)}</div>
              {shared.length > 0 && <p className="mt-2 text-xs text-ink-500"><span className="inline-block h-2 w-2 rounded-full bg-accent-400" /> Highlighted = shared with you ({shared.length})</p>}
              {communities.length > 0 && <>
                <h3 className="label mt-5">Likely communities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {communities.map((c) => <button key={c.id} onClick={() => setModal({ type: 'community', id: c.id })} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50">{c.emoji} {c.name}</button>)}
                </div>
              </>}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-accent-50 to-amber-50 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-accent-700"><Icon name="message" className="h-4 w-4" />Conversation starters</h3>
              <ul className="space-y-2">{starters.map((s) => <li key={s} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-ink-700">“{s}”</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
function MenuItem({ icon, label, onClick, danger }: { icon: 'x' | 'flag' | 'ban'; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cx('flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50', danger ? 'text-red-600' : 'text-ink-700')}>
      <Icon name={icon} className="h-4 w-4" />{label}
    </button>
  );
}
function Note({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">{label}</p>
      <p className="mt-1 text-sm text-ink-700">{text}</p>
    </div>
  );
}

/* ------------------------------ Connect modal ----------------------------- */
function ConnectModal({ id, surprise, onClose }: { id: string; surprise?: boolean; onClose: () => void }) {
  const { get, state, actions } = useStore();
  const p = get(id)!;
  const { shared } = matchScore(state.me.interests, p.interests);
  const first = p.name.split(' ')[0];
  const suggestions = [
    shared.length ? `Hi ${first}! I noticed we both enjoy ${shared.slice(0, 2).join(' and ').toLowerCase()}. Would you be up for a coffee sometime?` : `Hi ${first}! I'd love to learn more about what the ${p.team} team works on. Coffee sometime?`,
    `Hi ${first}, always great to meet people outside my team. Would you be open to a 20-minute virtual coffee?`,
  ];
  const [note, setNote] = useState(suggestions[0]);
  const send = () => { actions.sendRequest(id, note.trim(), surprise); onClose(); };
  return (
    <Modal open onClose={onClose} size="sm" title={surprise ? 'Send a Surprise Connect invite' : `Connect with ${first}`}
      subtitle="They'll need to accept before you're connected."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="send" onClick={send}>Send request</Button></>}>
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <Avatar person={p} />
          <div className="min-w-0"><p className="font-semibold">{p.name}</p><p className="truncate text-xs text-ink-500">{p.title} · {p.location}</p></div>
        </div>
        <div>
          <label className="label" htmlFor="note">Add a note (optional)</label>
          <textarea id="note" className="input min-h-[96px] resize-none" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-1 flex justify-between text-[11px] text-ink-500"><span>Keep it friendly and work-appropriate.</span><span>{note.length}/300</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => <button key={i} onClick={() => setNote(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-ink-700 hover:border-brand-300 hover:bg-brand-50">Suggestion {i + 1}</button>)}
          <button onClick={() => setNote('')} className="rounded-full px-3 py-1 text-xs text-ink-500 hover:bg-slate-100">Clear</button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- Coffee modal ----------------------------- */
function CoffeeModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { get, state, actions } = useStore();
  const p = get(id)!;
  const { shared } = matchScore(state.me.interests, p.interests);
  const places = meetingPlaces(state.me.location === p.location ? p.location : 'Remote');
  const sameOffice = state.me.location === p.location;
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return isoDate(d); })();
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState('16:00');
  const [mode, setMode] = useState<'In person' | 'Virtual'>(sameOffice ? 'In person' : 'Virtual');
  const [place, setPlace] = useState(sameOffice ? places[0] : 'Video call');
  const [note, setNote] = useState(shared.length ? `Chat about ${shared.slice(0, 2).join(' & ').toLowerCase()}` : 'Get to know each other');
  const error = date < todayISO() ? 'Pick today or a future date' : '';
  const starters = conversationStarters(shared, p);
  const submit = () => {
    if (error) return;
    actions.scheduleCoffee({ withId: id, date, time, mode, place: mode === 'Virtual' ? 'Video call' : place, note });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={<span className="flex items-center gap-2">☕ Coffee Connect</span>} subtitle={`Plan an informal 20–30 minute chat with ${p.name}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="accent" icon="coffee" onClick={submit} disabled={!!error}>Send coffee invite</Button></>}>
      <div className="grid gap-5 p-6 md:grid-cols-[1fr_.9fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date</label><input type="date" className="input" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label className="label">Time</label><input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          {error && <p className="-mt-2 text-xs text-red-600">{error}</p>}
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(['In person', 'Virtual'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} disabled={m === 'In person' && !sameOffice}
                  className={cx('rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40', mode === m ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-700 hover:bg-slate-50')}>
                  {m === 'In person' ? '🏢 In person' : '💻 Virtual'}
                </button>
              ))}
            </div>
            {!sameOffice && <p className="mt-1 text-[11px] text-ink-500">{p.name.split(' ')[0]} is based in {p.location}, so a virtual chat is suggested.</p>}
          </div>
          {mode === 'In person' && (
            <div><label className="label">Where</label>
              <select className="input" value={place} onChange={(e) => setPlace(e.target.value)}>{places.filter((x) => x !== 'Video call').map((x) => <option key={x}>{x}</option>)}</select>
            </div>
          )}
          <div><label className="label">Topic (optional)</label><input className="input" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /></div>
          <p className="flex items-start gap-1.5 text-[11px] text-ink-500"><Icon name="info" className="h-3.5 w-3.5 shrink-0" />Prototype only. No calendar invite or Teams meeting is created.</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-accent-50 to-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2"><Avatar person={p} size="sm" /><div><p className="text-sm font-semibold">{p.name}</p><p className="text-[11px] text-ink-500">{shared.length} shared interests</p></div></div>
          {shared.length > 0 && <div className="mb-3 flex flex-wrap gap-1">{shared.map((s) => <Chip key={s} label={s} shared size="sm" />)}</div>}
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-700">Conversation starters</h4>
          <ul className="space-y-2">{starters.map((s) => <li key={s} className="rounded-xl bg-white/80 px-3 py-2 text-xs text-ink-700">“{s}”</li>)}</ul>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------- Report / Block modals ------------------------ */
const REASONS = ['Inappropriate or offensive content', 'Harassment or unwanted contact', 'Spam or self-promotion', 'Impersonation or fake profile', 'Something else'];
function ReportModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { get, actions } = useStore();
  const p = get(id)!;
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  return (
    <Modal open onClose={onClose} size="sm" title={`Report ${p.name}`} subtitle="Reports are confidential. The person won't be told who reported them."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" icon="flag" disabled={!reason} onClick={() => { actions.report(id, reason, details); onClose(); }}>Submit report</Button></>}>
      <div className="space-y-3 p-6">
        {REASONS.map((r) => (
          <label key={r} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition', reason === r ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50')}>
            <input type="radio" name="reason" className="accent-red-600" checked={reason === r} onChange={() => setReason(r)} />{r}
          </label>
        ))}
        <textarea className="input min-h-[80px] resize-none" placeholder="Add details (optional). Please don't include sensitive personal information." maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
        <p className="text-[11px] text-ink-500">Prototype: the report is stored in this browser only and isn't sent to anyone.</p>
      </div>
    </Modal>
  );
}
function BlockModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { get, actions } = useStore();
  const p = get(id)!;
  return (
    <Modal open onClose={onClose} size="sm" title={`Block ${p.name}?`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" icon="ban" onClick={() => actions.block(id)}>Block</Button></>}>
      <ul className="space-y-2 p-6 text-sm text-ink-700">
        {['They won’t be able to see your profile or send you requests.', 'Any connection, pending request or coffee chat with them is removed.', 'They won’t be notified. You can unblock them any time from My Profile → Privacy.'].map((t) => (
          <li key={t} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{t}</li>
        ))}
      </ul>
    </Modal>
  );
}

/* ----------------------------- Community modal ---------------------------- */
function CommunityModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { state } = useStore();
  const c = communityById(state.communities, id);
  if (!c) return null;
  return <CommunityModalInner c={c} onClose={onClose} />;
}
function CommunityModalInner({ c, onClose }: { c: Community; onClose: () => void }) {
  const { state, actions, setModal, get } = useStore();
  const id = c.id;
  const { members, joined, count } = useCommunityMembers(c);
  const isLead = c.leadId === 'me';
  const events = upcoming(state.events.filter((e) => e.communityId === id));
  const lead = get(c.leadId);
  const all = joined ? [state.me, ...members] : members;
  return (
    <Modal open onClose={onClose} size="lg">
      <div className={cx('relative bg-gradient-to-br px-6 pb-6 pt-8 text-white', c.gradient)}>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-white/20 p-2 backdrop-blur transition hover:bg-white/30" aria-label="Close"><Icon name="x" /></button>
        <div className="text-5xl">{c.emoji}</div>
        <h2 className="mt-2 text-2xl font-bold">{c.name}</h2>
        <p className="opacity-90">{c.tagline}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {joined ? <Button variant="secondary" icon="check" onClick={() => actions.leave(id)}>Joined · Leave</Button>
            : <Button variant="accent" icon="plus" onClick={() => actions.join(id)}>Join community</Button>}
          <span className="text-sm opacity-90">{count} members · {c.schedule}</span>
          {isLead && <Button variant="danger" size="sm" icon="trash" className="ml-auto" onClick={() => actions.deleteCommunity(id)}>Delete community</Button>}
        </div>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="leading-relaxed text-ink-700">{c.description}</p>
          <h3 className="label mt-5">Upcoming activities</h3>
          {events.length ? <div className="space-y-3">{events.map((e) => <EventCard key={e.id} ev={e} compact />)}</div>
            : <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-ink-500">No activities scheduled yet. <button className="font-semibold text-brand-600" onClick={() => setModal({ type: 'createEvent' })}>Create one</button></div>}
        </div>
        <div>
          {lead && <>
            <h3 className="label">Organizer</h3>
            <button disabled={isLead} onClick={() => setModal({ type: 'profile', id: lead.id })} className="mb-5 flex w-full items-center gap-3 rounded-xl p-2 text-left transition enabled:hover:bg-slate-50">
              <Avatar person={lead} size="sm" /><div><p className="text-sm font-semibold">{lead.name}{isLead && ' (you)'}</p><p className="text-xs text-ink-500">{lead.location}</p></div>
            </button>
          </>}
          <h3 className="label">Members ({count})</h3>
          <div className="scrollbar-thin max-h-72 space-y-1 overflow-y-auto pr-1">
            {all.map((m) => (
              <button key={m.id} disabled={m.id === 'me'} onClick={() => setModal({ type: 'profile', id: m.id })}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition enabled:hover:bg-slate-50">
                <Avatar person={m} size="sm" />
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{m.name}{m.id === 'me' && ' (you)'}</p><p className="truncate text-xs text-ink-500">{m.department} · {m.location}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- Event modal ------------------------------ */
function EventModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { state, actions, setModal } = useStore();
  const ev = state.events.find((e) => e.id === id);
  if (!ev) return null;
  return <EventModalInner ev={ev} onClose={onClose} onDelete={() => { actions.deleteEvent(ev.id); setModal(null); }} />;
}
function EventModalInner({ ev, onClose, onDelete }: { ev: EventItem; onClose: () => void; onDelete: () => void }) {
  const { state, actions, setModal } = useStore();
  const { registered, people, going, full, host, isHost } = useEventInfo(ev);
  const comm = communityById(state.communities, ev.communityId);
  return (
    <Modal open onClose={onClose} title={ev.title} subtitle={comm ? `${comm.emoji} ${comm.name}` : 'Open to everyone'}
      footer={<>
        {isHost && <Button variant="danger" icon="trash" onClick={onDelete} className="mr-auto">Delete event</Button>}
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {!isHost && (registered ? <Button variant="secondary" onClick={() => actions.unregister(ev.id)}>Cancel registration</Button>
          : <Button disabled={full} onClick={() => actions.register(ev.id)}>{full ? 'Event full' : 'Register'}</Button>)}
      </>}>
      <div className="space-y-5 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info icon="calendar" label="Date" value={fmtDate(ev.date, { weekday: 'long', day: 'numeric', month: 'long' })} />
          <Info icon="clock" label="Time" value={`${fmtTime(ev.time)} – ${fmtTime(ev.endTime)}`} />
          <Info icon="pin" label="Location" value={ev.location} />
          <Info icon="users" label="Format & spots" value={`${ev.mode} · ${going}/${ev.capacity} going`} />
        </div>
        <p className="leading-relaxed text-ink-700">{ev.description}</p>
        {host && (
          <div><h3 className="label">Hosted by</h3>
            <button disabled={isHost} onClick={() => setModal({ type: 'profile', id: host.id })} className="flex items-center gap-3 rounded-xl p-1.5 text-left transition enabled:hover:bg-slate-50">
              <Avatar person={host} size="sm" /><span className="text-sm font-semibold">{host.name}{isHost && ' (you)'}</span>
            </button>
          </div>
        )}
        <div><h3 className="label">Who's going</h3>{people.length ? <AvatarStack people={people} max={10} size="sm" /> : <p className="text-sm text-ink-500">Be the first to register!</p>}</div>
        {registered && !isHost && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800"><Icon name="check" className="h-4 w-4" />You're registered. See you there!</div>}
      </div>
    </Modal>
  );
}
function Info({ icon, label, value }: { icon: 'calendar' | 'clock' | 'pin' | 'users'; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
      <div><p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p><p className="text-sm font-medium text-ink-900">{value}</p></div>
    </div>
  );
}

/* ---------------------------- Create event modal -------------------------- */
function CreateEventModal({ onClose }: { onClose: () => void }) {
  const { state, actions } = useStore();
  const [f, setF] = useState({ title: '', communityId: '', date: '', time: '17:00', endTime: '18:00', city: state.me.location, location: '', mode: 'In person' as EventMode, description: '', capacity: 20 });
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const errors: Record<string, string> = {};
  if (f.title.trim().length < 4) errors.title = 'Give your event a title (at least 4 characters)';
  if (!f.date) errors.date = 'Pick a date'; else if (f.date < todayISO()) errors.date = 'Date must be today or later';
  if (f.endTime <= f.time) errors.endTime = 'End time must be after start';
  if (!f.location.trim()) errors.location = 'Where is it happening?';
  if (f.description.trim().length < 10) errors.description = 'Add a short description (10+ characters)';
  if (!(f.capacity >= 2 && f.capacity <= 500)) errors.capacity = 'Between 2 and 500';
  const ok = Object.keys(errors).length === 0;
  const err = (k: string) => touched && errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;
  const submit = () => {
    setTouched(true);
    if (!ok) return;
    const done = actions.createEvent({ ...f, title: f.title.trim(), communityId: f.communityId || null, description: f.description.trim(), location: f.location.trim() });
    if (done) onClose();
  };
  return (
    <Modal open onClose={onClose} title="Create an activity" subtitle="Bring colleagues together around something you enjoy"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="plus" onClick={submit}>Publish event</Button></>}>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Title</label><input className="input" placeholder="e.g. Saturday Cycling Loop" value={f.title} maxLength={80} onChange={(e) => set('title', e.target.value)} />{err('title')}</div>
        <div><label className="label">Community</label>
          <select className="input" value={f.communityId} onChange={(e) => set('communityId', e.target.value)}>
            <option value="">Open to everyone</option>{state.communities.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select></div>
        <div><label className="label">Format</label>
          <select className="input" value={f.mode} onChange={(e) => set('mode', e.target.value as EventMode)}>{(['In person', 'Virtual', 'Hybrid'] as const).map((m) => <option key={m}>{m}</option>)}</select></div>
        <div><label className="label">Date</label><input type="date" className="input" min={todayISO()} value={f.date} onChange={(e) => set('date', e.target.value)} />{err('date')}</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Start</label><input type="time" className="input" value={f.time} onChange={(e) => set('time', e.target.value)} /></div>
          <div><label className="label">End</label><input type="time" className="input" value={f.endTime} onChange={(e) => set('endTime', e.target.value)} /></div>
          <div className="col-span-2">{err('endTime')}</div>
        </div>
        <div><label className="label">Office / city</label>
          <select className="input" value={f.city} onChange={(e) => set('city', e.target.value)}>{[...LOCATIONS, 'All offices'].map((l) => <option key={l}>{l}</option>)}</select></div>
        <div><label className="label">Capacity</label><input type="number" className="input" min={2} max={500} value={f.capacity} onChange={(e) => set('capacity', Number(e.target.value))} />{err('capacity')}</div>
        <div className="sm:col-span-2"><label className="label">Location / venue</label><input className="input" placeholder="e.g. Bangalore office — Level 3 breakout, or Video call" value={f.location} maxLength={120} onChange={(e) => set('location', e.target.value)} />{err('location')}</div>
        <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-[90px] resize-none" maxLength={500} placeholder="What should people expect? What should they bring?" value={f.description} onChange={(e) => set('description', e.target.value)} />{err('description')}</div>
      </div>
    </Modal>
  );
}

/* -------------------------- Create community modal ------------------------ */
const MAX_TAGS = 5;
function CreateCommunityModal({ onClose }: { onClose: () => void }) {
  const { state, actions, toast } = useStore();
  const [f, setF] = useState({ name: '', emoji: COMMUNITY_EMOJIS[0], tagline: '', description: '', tags: [] as string[], schedule: '', gradient: COMMUNITY_GRADIENTS[0] });
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggleTag = (t: string) => {
    if (f.tags.includes(t)) return set('tags', f.tags.filter((x) => x !== t));
    if (f.tags.length >= MAX_TAGS) return toast(`Pick up to ${MAX_TAGS} interests`, 'error');
    set('tags', [...f.tags, t]);
  };
  const errors: Record<string, string> = {};
  if (f.name.trim().length < 3) errors.name = 'Give your community a name (at least 3 characters)';
  else if (state.communities.some((c) => c.name.toLowerCase() === f.name.trim().toLowerCase())) errors.name = 'A community with this name already exists';
  if (f.tagline.trim().length < 3) errors.tagline = 'Add a short tagline';
  if (f.description.trim().length < 10) errors.description = 'Add a short description (10+ characters)';
  if (!f.tags.length) errors.tags = 'Pick at least one interest so colleagues can find it';
  const ok = Object.keys(errors).length === 0;
  const err = (k: string) => touched && errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;
  const submit = () => {
    setTouched(true);
    if (!ok) return;
    const done = actions.createCommunity({
      ...f, name: f.name.trim(), tagline: f.tagline.trim(), description: f.description.trim(), schedule: f.schedule.trim() || 'Schedule to be announced',
    });
    if (done) onClose();
  };
  return (
    <Modal open onClose={onClose} title="Create a community" subtitle="Start a group around something you love. You'll be the organizer."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="plus" onClick={submit}>Create community</Button></>}>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Name</label><input className="input" placeholder="e.g. Weekend Cyclists" value={f.name} maxLength={40} onChange={(e) => set('name', e.target.value)} />{err('name')}</div>
        <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" placeholder="e.g. Pedal, chat, repeat" value={f.tagline} maxLength={60} onChange={(e) => set('tagline', e.target.value)} />{err('tagline')}</div>
        <div><label className="label">Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {COMMUNITY_EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => set('emoji', e)} aria-pressed={f.emoji === e}
                className={cx('flex h-9 w-9 items-center justify-center rounded-lg text-lg transition', f.emoji === e ? 'bg-brand-50 ring-2 ring-brand-500' : 'hover:bg-slate-100')}>{e}</button>
            ))}
          </div></div>
        <div><label className="label">Colour</label>
          <div className="flex flex-wrap gap-2">
            {COMMUNITY_GRADIENTS.map((g) => (
              <button key={g} type="button" onClick={() => set('gradient', g)} aria-label="Choose colour" aria-pressed={f.gradient === g}
                className={cx('h-9 w-9 rounded-lg bg-gradient-to-br transition', g, f.gradient === g ? 'ring-2 ring-brand-500 ring-offset-2' : 'hover:scale-105')} />
            ))}
          </div>
          <div className={cx('mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-br p-3 text-white', f.gradient)}>
            <span className="text-2xl">{f.emoji}</span><span className="truncate font-bold">{f.name.trim() || 'Your community'}</span>
          </div></div>
        <div className="sm:col-span-2"><label className="label">Meets</label><input className="input" placeholder="e.g. Saturdays · 6:30 AM (optional)" value={f.schedule} maxLength={60} onChange={(e) => set('schedule', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-[90px] resize-none" maxLength={400} placeholder="What will you do together? Who is it for?" value={f.description} onChange={(e) => set('description', e.target.value)} />{err('description')}</div>
        <div className="sm:col-span-2">
          <label className="label">Related interests ({f.tags.length}/{MAX_TAGS})</label>
          <div className="scrollbar-thin max-h-44 space-y-3 overflow-y-auto pr-1">
            {INTEREST_GROUPS.map((g) => (
              <div key={g.name} className="flex flex-wrap gap-1.5">{g.items.map((i) => <Chip key={i} label={i} size="sm" active={f.tags.includes(i)} onClick={() => toggleTag(i)} />)}</div>
            ))}
          </div>
          {err('tags')}
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Surprise Connect --------------------------- */
function SurpriseModal({ onClose }: { onClose: () => void }) {
  const { state, employees, status, setModal, actions } = useStore();
  const pool = useMemo(() => employees.filter((e) => e.department !== state.me.department && e.team !== state.me.team && status(e.id) === 'none'), [employees, state.me, status]);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * Math.max(pool.length, 1)));
  const [spin, setSpin] = useState(0);
  useEffect(() => { if (idx >= pool.length) setIdx(0); }, [pool.length, idx]);
  const shuffle = () => {
    if (pool.length < 2) return;
    let n = idx; while (n === idx) n = Math.floor(Math.random() * pool.length);
    setIdx(n); setSpin((s) => s + 1);
  };
  if (!state.settings.surprise) {
    return (
      <Modal open onClose={onClose} size="sm" title="Surprise Connect is off"
        footer={<><Button variant="ghost" onClick={onClose}>Not now</Button><Button icon="sparkles" onClick={() => actions.updateSettings({ surprise: true })}>Turn on</Button></>}>
        <p className="p-6 text-sm text-ink-700">Surprise Connect suggests a random colleague from outside your team. It's optional, and both of you must accept before connecting. You can turn it off again any time in your privacy settings.</p>
      </Modal>
    );
  }
  const p = pool[idx];
  if (!p) return (
    <Modal open onClose={onClose} size="sm" title="Surprise Connect">
      <div className="p-6 text-center text-sm text-ink-500">🎉 You've already reached out to everyone outside your team. Impressive!</div>
    </Modal>
  );
  const { shared } = matchScore(state.me.interests, p.interests);
  const topics = conversationStarters(shared, p);
  return (
    <Modal open onClose={onClose} size="md">
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-brand-600 to-accent-500 px-6 pb-16 pt-6 text-white">
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-white/20 p-2 backdrop-blur transition hover:bg-white/30" aria-label="Close"><Icon name="x" /></button>
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90"><Icon name="sparkles" className="h-4 w-4" />Surprise Connect</p>
        <h2 className="mt-1 text-xl font-bold">Meet someone outside your team</h2>
        <p className="text-sm opacity-90">A random colleague from a different department. Mutual acceptance is required.</p>
      </div>
      <div key={spin} className="-mt-12 animate-popIn px-6 pb-6">
        <div className="card p-5 text-center">
          <div className="flex justify-center"><Avatar person={p} size="xl" ring /></div>
          <h3 className="mt-3 text-lg font-bold">{p.name}</h3>
          <p className="text-sm text-ink-500">{p.title} · {p.department}</p>
          <p className="text-xs text-ink-500"><Icon name="pin" className="mr-0.5 inline h-3.5 w-3.5 -translate-y-px" />{p.location}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">{p.interests.map((i) => <Chip key={i} label={i} shared={shared.includes(i)} size="sm" />)}</div>
          <p className="mt-2 text-xs text-ink-500">{shared.length ? `You share ${shared.length} interest${shared.length > 1 ? 's' : ''}` : 'No shared interests yet. A great chance to discover something new!'}</p>
        </div>
        <h4 className="label mt-5">Suggested topics</h4>
        <ul className="space-y-2">{topics.map((t) => <li key={t} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-ink-700">💬 {t}</li>)}</ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" icon="shuffle" onClick={shuffle} disabled={pool.length < 2} className="flex-1">Shuffle</Button>
          <Button variant="secondary" icon="eye" onClick={() => setModal({ type: 'profile', id: p.id })} className="flex-1">View profile</Button>
          <Button icon="send" onClick={() => setModal({ type: 'connect', id: p.id, surprise: true })} className="w-full sm:flex-1">Send invite</Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------- Opt-in modal ---------------------------- */
function OptInModal({ onClose }: { onClose: () => void }) {
  const { actions, navigate } = useStore();
  return (
    <Modal open onClose={onClose} size="sm" title="Join Connect@MW to do that"
      footer={<><Button variant="ghost" onClick={onClose}>Keep browsing</Button><Button onClick={() => { actions.updateSettings({ participating: true }); onClose(); navigate('profile'); }}>Opt in & review profile</Button></>}>
      <p className="p-6 text-sm text-ink-700">Connecting, joining communities and registering for events need a visible profile. Participation is completely voluntary. You can pause or hide your profile any time.</p>
    </Modal>
  );
}
