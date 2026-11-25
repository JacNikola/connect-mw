import React, { useEffect } from 'react';
import type { Employee } from './types';
import { INTEREST_EMOJI } from './data';
import { useMatch, useStore } from './store';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------------------------------- Icons --------------------------------- */
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  userPlus: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  coffee: 'M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v2M10 2v2M14 2v2',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  pin: 'M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  building: 'M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M16 10h2a2 2 0 0 1 2 2v10M2 22h20M8 6h4M8 10h4M8 14h4M8 18h4',
  x: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  ban: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.9 4.9l14.2 14.2',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  chevronRight: 'M9 18l6-6-6-6',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  camera: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  lock: 'M5 11h14v11H5zM8 11V7a4 4 0 0 1 8 0v4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5z',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  more: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.9 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

/* --------------------------------- Avatar --------------------------------- */
const SIZES = { xs: 'h-7 w-7 text-[10px]', sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };
export function Avatar({ person, size = 'md', ring = false }: { person: Employee; size?: keyof typeof SIZES; ring?: boolean }) {
  const initials = person.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const bg = `linear-gradient(135deg, hsl(${person.hue} 70% 58%), hsl(${(person.hue + 40) % 360} 65% 42%))`;
  return (
    <div className={cx('relative shrink-0 overflow-hidden rounded-full font-semibold text-white', SIZES[size], ring && 'ring-4 ring-white')}
      style={person.photo ? undefined : { background: bg }}>
      {person.photo ? <img src={person.photo} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center">{initials}</span>}
    </div>
  );
}

export function AvatarStack({ people, max = 5, size = 'xs' as keyof typeof SIZES }: { people: Employee[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = people.slice(0, max);
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((p) => <div key={p.id} title={p.name}><Avatar person={p} size={size} ring /></div>)}
      </div>
      {people.length > max && <span className="ml-2 text-xs font-medium text-ink-500">+{people.length - max}</span>}
    </div>
  );
}

/* --------------------------------- Button --------------------------------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'success';
const VARIANTS: Record<BtnVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/25',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  secondary: 'bg-white text-ink-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-ink-700 hover:bg-slate-100',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};
export function Button({ variant = 'primary', size = 'md', icon, children, className, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: IconName }) {
  const sz = size === 'sm' ? 'h-8 px-3 text-xs gap-1.5' : size === 'lg' ? 'h-12 px-5 text-sm gap-2' : 'h-10 px-4 text-sm gap-2';
  return (
    <button {...rest}
      className={cx('inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100', sz, VARIANTS[variant], className)}>
      {icon && <Icon name={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

/* ---------------------------------- Chips --------------------------------- */
export function Chip({ label, shared, active, onClick, size = 'md' }: { label: string; shared?: boolean; active?: boolean; onClick?: () => void; size?: 'sm' | 'md' }) {
  const cls = cx(
    'inline-flex items-center gap-1 rounded-full border font-medium transition',
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
    active ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
      : shared ? 'border-accent-200 bg-accent-50 text-accent-700'
        : 'border-slate-200 bg-slate-50 text-ink-700',
    onClick && !active && 'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
  );
  const content = <><span aria-hidden>{INTEREST_EMOJI[label] ?? '•'}</span>{label}</>;
  return onClick
    ? <button type="button" onClick={onClick} aria-pressed={!!active} className={cls}>{content}</button>
    : <span className={cls}>{content}</span>;
}

/* ---------------------------------- Modal --------------------------------- */
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }:
  { open: boolean; onClose: () => void; title?: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  const w = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 animate-fadeIn bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx('relative flex max-h-[92vh] w-full animate-popIn flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl', w)}>
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="-mr-2 rounded-full p-2 text-ink-500 transition hover:bg-slate-100" aria-label="Close"><Icon name="x" /></button>
          </div>
        )}
        <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------- Misc pieces ------------------------------ */
export function EmptyState({ emoji, title, text, action }: { emoji: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl">{emoji}</div>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function Ring({ pct, size, color, title, caption }: { pct: number; size: number; color: string; title: string; caption?: string }) {
  const stroke = size < 40 ? 3 : 4, r = size / 2 - stroke, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={title}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef2f6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className={cx('font-bold text-ink-900', size < 40 ? 'text-[10px]' : 'text-[13px]')}>{pct}%</span>
        {caption && size >= 56 && <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-500">{caption}</span>}
      </div>
    </div>
  );
}

export function MatchRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const color = pct >= 50 ? '#e8681a' : pct >= 25 ? '#0076a8' : '#94a3b8';
  return <Ring pct={pct} size={size} color={color} title={`${pct}% interest match`} caption="match" />;
}

export function ProgressRing({ pct, size = 36 }: { pct: number; size?: number }) {
  return <Ring pct={pct} size={size} color={pct >= 100 ? '#059669' : '#0076a8'} title={`Profile ${pct}% complete`} />;
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#0076a8" />
        <circle cx="12.5" cy="16" r="6" fill="none" stroke="#fff" strokeWidth="2.6" />
        <circle cx="19.5" cy="16" r="6" fill="none" stroke="#f9823a" strokeWidth="2.6" />
      </svg>
      <div className="leading-tight">
        <p className={cx('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-900')}>Connect<span className="text-accent-500">@</span>MW</p>
        <p className={cx('hidden text-[10px] font-medium sm:block', light ? 'text-white/70' : 'text-ink-500')}>Connecting People Beyond Work</p>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-500">{description}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cx('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand-600' : 'bg-slate-300')}>
        <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cx('flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition',
            value === t.id ? 'bg-ink-900 text-white shadow' : 'text-ink-500 hover:bg-white hover:text-ink-900')}>
          {t.label}
          {t.count !== undefined && (
            <span className={cx('rounded-full px-1.5 text-[11px]', value === t.id ? 'bg-white/20' : 'bg-slate-200 text-ink-700')}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500 sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ title, action, icon }: { title: string; action?: React.ReactNode; icon?: IconName }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
        {icon && <Icon name={icon} className="h-[18px] w-[18px] text-brand-600" />}{title}
      </h2>
      {action}
    </div>
  );
}

export function LinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-800">
      {children}<Icon name="chevronRight" className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------ Date helpers ------------------------------ */
export const parseISO = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) => parseISO(iso).toLocaleDateString(undefined, opts);
export const fmtTime = (t: string) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
export const relativeDay = (iso: string) => {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((parseISO(iso).getTime() - t.getTime()) / 86400e3);
  return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff < 0 ? 'Past' : diff < 7 ? `In ${diff} days` : fmtDate(iso);
};
export const timeAgo = (ts: number) => {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ------------------------------ Connect action ---------------------------- */
export function ConnectAction({ person, size = 'sm', full }: { person: Employee; size?: 'sm' | 'md'; full?: boolean }) {
  const { status, actions, setModal } = useStore();
  const st = status(person.id);
  const w = full ? 'w-full' : '';
  if (st === 'connected') return <Button size={size} variant="accent" icon="coffee" className={w} onClick={(e) => { e.stopPropagation(); setModal({ type: 'coffee', id: person.id }); }}>Coffee</Button>;
  if (st === 'outgoing') return <Button size={size} variant="secondary" icon="clock" className={w} onClick={(e) => { e.stopPropagation(); actions.withdraw(person.id); }} title="Click to withdraw">Requested</Button>;
  if (st === 'incoming') return (
    <div className={cx('flex gap-1.5', w)} onClick={(e) => e.stopPropagation()}>
      <Button size={size} variant="success" icon="check" className="flex-1" onClick={() => actions.accept(person.id)}>Accept</Button>
      <Button size={size} variant="secondary" className="flex-1" onClick={() => actions.decline(person.id)}>Decline</Button>
    </div>
  );
  return <Button size={size} icon="userPlus" className={w} onClick={(e) => { e.stopPropagation(); setModal({ type: 'connect', id: person.id }); }}>Connect</Button>;
}

/* ------------------------------- Person card ------------------------------ */
export function PersonCard({ person, delay = 0 }: { person: Employee; delay?: number }) {
  const { setModal, state } = useStore();
  const { shared, pct } = useMatch(person);
  const others = person.interests.filter((i) => !shared.includes(i));
  const chips = [...shared, ...others].slice(0, 4);
  const extra = person.interests.length - chips.length;
  return (
    <div onClick={() => setModal({ type: 'profile', id: person.id })} style={{ animationDelay: `${delay}ms` }}
      className="group card flex animate-slideUp cursor-pointer flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <Avatar person={person} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-ink-900 group-hover:text-brand-700">{person.name}</h3>
          <p className="truncate text-xs text-ink-500">{person.title}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-500">
            <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />{person.location}
            {person.location === state.me.location && <span className="ml-1 rounded bg-brand-50 px-1.5 text-[10px] font-semibold text-brand-700">Your office</span>}
          </p>
        </div>
        <MatchRing pct={pct} />
      </div>
      <p className="mt-2 truncate text-xs font-medium text-ink-500"><Icon name="building" className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />{person.department}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((i) => <Chip key={i} label={i} shared={shared.includes(i)} size="sm" />)}
        {extra > 0 && <span className="px-1 py-0.5 text-[11px] text-ink-500">+{extra}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-xs text-ink-500">
          {shared.length > 0 ? <><b className="text-accent-600">{shared.length}</b> shared interest{shared.length > 1 ? 's' : ''}</> : 'New perspectives'}
        </span>
        <ConnectAction person={person} />
      </div>
    </div>
  );
}
