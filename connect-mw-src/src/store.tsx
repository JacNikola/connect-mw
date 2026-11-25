import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, CoffeeChat, Community, ConnStatus, Employee, EventItem, Settings } from './types';
import { COMMUNITIES, EMPLOYEES } from './data';
import type { Session } from './auth';

export type ToastKind = 'success' | 'info' | 'error';
export interface Toast { id: number; text: string; kind: ToastKind }

export type ModalState =
  | { type: 'profile'; id: string }
  | { type: 'connect'; id: string; surprise?: boolean }
  | { type: 'coffee'; id: string }
  | { type: 'report'; id: string }
  | { type: 'block'; id: string }
  | { type: 'community'; id: string }
  | { type: 'event'; id: string }
  | { type: 'createEvent' }
  | { type: 'createCommunity' }
  | { type: 'surprise' }
  | { type: 'optin' }
  | null;

export interface Route { page: string; params: URLSearchParams }

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [page, query] = raw.split('?');
  return { page: page || 'dashboard', params: new URLSearchParams(query || '') };
}

function load(session: Session): AppState {
  try {
    const raw = localStorage.getItem(session.stateKey);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Fill in fields added after the first release so older saved data keeps working.
      if (parsed && parsed.version === 1) return { ...parsed, requestsSeenAt: parsed.requestsSeenAt ?? 0, communities: parsed.communities ?? [...COMMUNITIES] };
    }
  } catch { /* ignore corrupt storage */ }
  return session.fresh();
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function matchScore(a: string[], b: string[]) {
  const shared = a.filter((x) => b.includes(x));
  const total = a.length + b.length;
  const pct = total === 0 ? 0 : Math.round((200 * shared.length) / total);
  return { shared, pct };
}

export const profileCompleteness = (me: Employee) => [!!me.photo, me.bio.length > 20, me.interests.length >= 3, !!me.team].filter(Boolean).length * 25;

function useStoreValue(session: Session, onLogout: () => void) {
  const [state, setState] = useState<AppState>(() => load(session));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [route, setRoute] = useState<Route>(parseHash);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try { localStorage.setItem(session.stateKey, JSON.stringify(state)); } catch { /* storage full */ }
  }, [state, session.stateKey]);

  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((path: string) => { window.location.hash = '/' + path; }, []);

  const toast = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const employees = useMemo(() => EMPLOYEES.filter((e) => !state.blocked.includes(e.id)), [state.blocked]);
  const byId = useMemo(() => Object.fromEntries(EMPLOYEES.map((e) => [e.id, e])) as Record<string, Employee>, []);
  const get = useCallback((id: string): Employee | undefined => (id === 'me' ? stateRef.current.me : byId[id]), [byId]);
  const status = useCallback((id: string): ConnStatus | 'none' => state.connections[id]?.status ?? 'none', [state.connections]);

  const requireOptIn = useCallback(() => {
    if (stateRef.current.settings.participating) return true;
    setModal({ type: 'optin' });
    return false;
  }, []);

  const patch = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const actions = useMemo(() => {
    const name = (id: string) => byId[id]?.name.split(' ')[0] ?? 'Colleague';
    return {
      updateMe(p: Partial<Employee>) { patch((s) => ({ ...s, me: { ...s.me, ...p } })); },
      updateSettings(p: Partial<Settings>) { patch((s) => ({ ...s, settings: { ...s.settings, ...p } })); },
      finishOnboarding(participate: boolean) {
        patch((s) => ({ ...s, onboarded: true, settings: { ...s.settings, participating: participate } }));
      },
      sendRequest(id: string, note: string, surprise = false) {
        if (!requireOptIn()) return;
        patch((s) => ({ ...s, connections: { ...s.connections, [id]: { status: 'outgoing', at: Date.now(), note, surprise } } }));
        toast(`Request sent to ${name(id)}. They need to accept before you're connected.`, 'info');
        // Simulated response so the prototype feels alive. A real system would wait for the colleague.
        setTimeout(() => {
          if (stateRef.current.connections[id]?.status !== 'outgoing') return;
          patch((s) => ({ ...s, connections: { ...s.connections, [id]: { ...s.connections[id], status: 'connected', at: Date.now() } } }));
          toast(`🎉 ${name(id)} accepted your request (simulated)`);
        }, 5000);
      },
      withdraw(id: string) {
        patch((s) => { const c = { ...s.connections }; delete c[id]; return { ...s, connections: c }; });
        toast(`Request to ${name(id)} withdrawn`, 'info');
      },
      accept(id: string) {
        if (!requireOptIn()) return;
        patch((s) => ({ ...s, connections: { ...s.connections, [id]: { ...s.connections[id], status: 'connected', at: Date.now() } } }));
        toast(`You're now connected with ${name(id)} ☕`);
      },
      decline(id: string) {
        patch((s) => { const c = { ...s.connections }; delete c[id]; return { ...s, connections: c }; });
        toast(`Request declined. ${name(id)} won't be notified.`, 'info');
      },
      removeConnection(id: string) {
        patch((s) => { const c = { ...s.connections }; delete c[id]; return { ...s, connections: c, coffee: s.coffee.filter((x) => x.withId !== id) }; });
        toast(`Removed ${name(id)} from your connections`, 'info');
      },
      block(id: string) {
        patch((s) => {
          const c = { ...s.connections }; delete c[id];
          return { ...s, connections: c, blocked: [...new Set([...s.blocked, id])], coffee: s.coffee.filter((x) => x.withId !== id) };
        });
        setModal(null);
        toast(`${name(id)} is blocked. They can't see your profile or contact you.`, 'info');
      },
      unblock(id: string) { patch((s) => ({ ...s, blocked: s.blocked.filter((x) => x !== id) })); toast(`${name(id)} unblocked`, 'info'); },
      report(id: string, reason: string, details: string) {
        patch((s) => ({ ...s, reports: [...s.reports, { id: uid(), targetId: id, reason, details, at: Date.now() }] }));
        toast('Report recorded locally. In production, this would go to a People & Culture reviewer.', 'info');
      },
      join(id: string) {
        if (!requireOptIn()) return;
        patch((s) => ({ ...s, joined: [...new Set([...s.joined, id])] }));
        toast('Welcome to the community! 🎉');
      },
      leave(id: string) { patch((s) => ({ ...s, joined: s.joined.filter((x) => x !== id) })); toast('You left the community', 'info'); },
      createCommunity(c: Omit<Community, 'id' | 'leadId'>) {
        if (!requireOptIn()) return false;
        const id = 'cm-' + uid();
        patch((s) => ({ ...s, communities: [...s.communities, { ...c, id, leadId: 'me' }], joined: [...s.joined, id] }));
        toast(`“${c.name}” is live! You're the organizer.`);
        return true;
      },
      deleteCommunity(id: string) {
        patch((s) => ({
          ...s,
          communities: s.communities.filter((x) => x.id !== id),
          joined: s.joined.filter((x) => x !== id),
          events: s.events.map((e) => (e.communityId === id ? { ...e, communityId: null } : e)),
        }));
        setModal(null);
        toast('Community deleted', 'info');
      },
      markRequestsSeen() {
        const now = Date.now();
        patch((s) => (Object.values(s.connections).some((c) => c.status === 'incoming' && c.at > s.requestsSeenAt) ? { ...s, requestsSeenAt: now } : s));
      },
      register(id: string) {
        if (!requireOptIn()) return;
        const ev = stateRef.current.events.find((x) => x.id === id);
        if (!ev) return;
        if (ev.attendees.length + 1 > ev.capacity) { toast('Sorry, this event is full', 'error'); return; }
        patch((s) => ({ ...s, registered: [...new Set([...s.registered, id])] }));
        toast(`You're registered for “${ev.title}”`);
      },
      unregister(id: string) { patch((s) => ({ ...s, registered: s.registered.filter((x) => x !== id) })); toast('Registration cancelled', 'info'); },
      createEvent(ev: Omit<EventItem, 'id' | 'attendees' | 'hostId'>) {
        if (!requireOptIn()) return false;
        const id = 'ev-' + uid();
        patch((s) => ({ ...s, events: [...s.events, { ...ev, id, hostId: 'me', attendees: [] }], registered: [...s.registered, id] }));
        toast('Event published! You’re registered as the host.');
        return true;
      },
      deleteEvent(id: string) {
        patch((s) => ({ ...s, events: s.events.filter((x) => x.id !== id), registered: s.registered.filter((x) => x !== id) }));
        toast('Event deleted', 'info');
      },
      scheduleCoffee(c: Omit<CoffeeChat, 'id' | 'status' | 'createdAt'>) {
        if (!requireOptIn()) return;
        const id = 'cf-' + uid();
        patch((s) => ({ ...s, coffee: [...s.coffee, { ...c, id, status: 'proposed', createdAt: Date.now() }] }));
        toast(`Coffee invite sent to ${name(c.withId)} ☕`, 'info');
        setTimeout(() => {
          if (!stateRef.current.coffee.some((x) => x.id === id)) return;
          patch((s) => ({ ...s, coffee: s.coffee.map((x) => (x.id === id ? { ...x, status: 'confirmed' } : x)) }));
          toast(`${name(c.withId)} confirmed your coffee chat (simulated)`);
        }, 4500);
      },
      cancelCoffee(id: string) { patch((s) => ({ ...s, coffee: s.coffee.filter((x) => x.id !== id) })); toast('Coffee chat cancelled', 'info'); },
      reset() {
        localStorage.removeItem(session.stateKey);
        setState(session.fresh());
        setModal(null);
        toast('Demo data reset', 'info');
        navigate('dashboard');
      },
      logout() {
        setModal(null);
        onLogout();
      },
    };
  }, [byId, patch, requireOptIn, toast, navigate, session, onLogout]);

  const unseenRequests = employees.filter((e) => {
    const c = state.connections[e.id];
    return c?.status === 'incoming' && c.at > state.requestsSeenAt;
  }).length;

  return { state, employees, get, status, unseenRequests, actions, toasts, toast, dismissToast, modal, setModal, route, navigate, requireOptIn, session };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ session, onLogout, children }: { session: Session; onLogout: () => void; children: React.ReactNode }) {
  const value = useStoreValue(session, onLogout);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
}

/** Match info for a colleague relative to the current user. */
export function useMatch(other: Employee) {
  const { state } = useStore();
  return useMemo(() => matchScore(state.me.interests, other.interests), [state.me.interests, other.interests]);
}
