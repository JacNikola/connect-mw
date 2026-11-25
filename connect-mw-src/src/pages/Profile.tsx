import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, INTEREST_GROUPS, LOCATIONS } from '../data';
import { useStore } from '../store';
import type { Employee } from '../types';
import { Avatar, Button, Chip, Icon, Modal, PageHeader, Toggle, cx } from '../ui';

const MAX_INTERESTS = 12;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 192, c = document.createElement('canvas');
        c.width = c.height = size;
        const s = Math.min(img.width, img.height);
        c.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { state, actions, toast, get } = useStore();
  const [draft, setDraft] = useState<Employee>(state.me);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(state.me), [state.me]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.me);
  const set = <K extends keyof Employee>(k: K, v: Employee[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const s = state.settings;

  const toggleInterest = (i: string) => {
    if (draft.interests.includes(i)) return set('interests', draft.interests.filter((x) => x !== i));
    if (draft.interests.length >= MAX_INTERESTS) return toast(`You can pick up to ${MAX_INTERESTS} interests`, 'error');
    set('interests', [...draft.interests, i]);
  };
  const errors = [
    draft.name.trim().length < 2 && 'Please enter your name',
    draft.title.trim().length < 2 && 'Please enter your role',
    draft.interests.length < 1 && 'Pick at least one interest',
  ].filter(Boolean) as string[];
  const save = () => {
    if (errors.length) return toast(errors[0], 'error');
    actions.updateMe({ ...draft, name: draft.name.trim(), title: draft.title.trim(), team: draft.team.trim(), bio: draft.bio.trim() });
    toast('Profile saved');
  };
  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast('Please choose an image file', 'error');
    if (f.size > 8 * 1024 * 1024) return toast('Image must be under 8 MB', 'error');
    try { set('photo', await resizeImage(f)); } catch { toast('Could not read that image', 'error'); }
  };

  return (
    <div className="pb-24">
      <PageHeader title="My Profile" subtitle="Share as much or as little as you like. Everything here is optional apart from name, role and one interest." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Preview */}
        <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
          <div className="card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" />
            <div className="-mt-10 px-5 pb-5">
              <div className="relative inline-block">
                <Avatar person={draft} size="xl" ring />
                <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 rounded-full bg-brand-600 p-2 text-white shadow-lg transition hover:bg-brand-700" aria-label="Change photo"><Icon name="camera" className="h-4 w-4" /></button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              </div>
              {draft.photo && <button onClick={() => set('photo', undefined)} className="ml-3 text-xs font-semibold text-red-600 hover:underline">Remove photo</button>}
              <h2 className="mt-2 text-xl font-bold">{draft.name || 'Your name'}</h2>
              <p className="text-sm text-ink-700">{draft.title || 'Your role'}{draft.team && ` · ${draft.team}`}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-500">
                <span><Icon name="building" className="mr-0.5 inline h-3.5 w-3.5 -translate-y-px" />{draft.department}</span>
                {s.showLocation && <span><Icon name="pin" className="mr-0.5 inline h-3.5 w-3.5 -translate-y-px" />{draft.location}</span>}
              </p>
              <p className="mt-3 text-sm text-ink-700">{draft.bio || <span className="italic text-ink-500">Add a short intro…</span>}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{draft.interests.map((i) => <Chip key={i} label={i} size="sm" />)}</div>
              <div className={cx('mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium', s.participating ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800')}>
                <Icon name={s.participating ? 'eye' : 'lock'} className="h-4 w-4" />
                {s.participating ? (s.visibility === 'everyone' ? 'Visible to colleagues who opted in' : 'Full profile visible to connections only') : 'Hidden. You are browsing privately.'}
              </div>
            </div>
          </div>
          <p className="px-1 text-xs text-ink-500">This is a preview of how colleagues see you.</p>
        </aside>

        <div className="space-y-6">
          {/* Basics */}
          <section className="card p-6">
            <h3 className="mb-4 text-base font-bold">About you</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="pn">Name</label><input id="pn" className="input" value={draft.name} maxLength={60} onChange={(e) => set('name', e.target.value)} /></div>
              <div><label className="label" htmlFor="pt">Role</label><input id="pt" className="input" value={draft.title} maxLength={60} onChange={(e) => set('title', e.target.value)} /></div>
              <div><label className="label" htmlFor="pd">Department</label><select id="pd" className="input" value={draft.department} onChange={(e) => set('department', e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div><label className="label" htmlFor="pteam">Team</label><input id="pteam" className="input" value={draft.team} maxLength={60} placeholder="e.g. Simulink Code Generation" onChange={(e) => set('team', e.target.value)} /></div>
              <div><label className="label" htmlFor="pl">Office location</label><select id="pl" className="input" value={draft.location} onChange={(e) => set('location', e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="pb">Short introduction</label>
                <textarea id="pb" className="input min-h-[90px] resize-none" maxLength={280} value={draft.bio} placeholder="What do you work on? What do you enjoy outside work?" onChange={(e) => set('bio', e.target.value)} />
                <div className="mt-1 flex justify-between text-[11px] text-ink-500"><span>Please don't include phone numbers, home address or other sensitive details.</span><span>{draft.bio.length}/280</span></div>
              </div>
            </div>
          </section>

          {/* Interests */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">Interests & hobbies</h3>
              <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold', draft.interests.length ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600')}>{draft.interests.length}/{MAX_INTERESTS} selected</span>
            </div>
            <div className="space-y-4">
              {INTEREST_GROUPS.map((g) => (
                <div key={g.name}>
                  <p className="mb-2 text-xs font-semibold text-ink-500">{g.emoji} {g.name}</p>
                  <div className="flex flex-wrap gap-2">{g.items.map((i) => <Chip key={i} label={i} active={draft.interests.includes(i)} onClick={() => toggleInterest(i)} />)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section className="card p-6">
            <h3 className="mb-1 flex items-center gap-2 text-base font-bold"><Icon name="shield" className="h-5 w-5 text-brand-600" />Privacy & visibility</h3>
            <p className="mb-2 text-sm text-ink-500">These settings save instantly.</p>
            <div className="divide-y divide-slate-100">
              <Toggle checked={s.participating} onChange={(v) => { actions.updateSettings({ participating: v }); toast(v ? 'Your profile is now visible' : 'Your profile is hidden. You can still browse.', 'info'); }}
                label="Participate in Connect@MW" description="Opt in to appear in Discover and receive requests. Turn off to hide your profile entirely." />
              <div className={cx('py-3', !s.participating && 'pointer-events-none opacity-50')}>
                <p className="text-sm font-semibold">Who can see your full profile</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {([['everyone', 'Everyone who opted in', 'Name, role, intro and interests'], ['connections', 'Connections only', 'Others see your name, department and interests']] as const).map(([v, l, d]) => (
                    <button key={v} onClick={() => actions.updateSettings({ visibility: v })}
                      className={cx('rounded-xl border p-3 text-left transition', s.visibility === v ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:bg-slate-50')}>
                      <span className="block text-sm font-semibold">{l}</span><span className="text-xs text-ink-500">{d}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={s.showLocation} onChange={(v) => actions.updateSettings({ showLocation: v })} label="Show my office location" description="Helps colleagues suggest in-person coffee chats." />
              <Toggle checked={s.allowRequests} onChange={(v) => actions.updateSettings({ allowRequests: v })} label="Allow connection requests" description="When off, colleagues can still see you but can't send requests." />
              <Toggle checked={s.surprise} onChange={(v) => actions.updateSettings({ surprise: v })} label="Surprise Connect" description="Be suggested to (and receive suggestions of) colleagues outside your team. Always requires mutual acceptance." />
            </div>
          </section>

          {/* Blocked */}
          <section className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><Icon name="ban" className="h-5 w-5 text-ink-500" />Blocked people</h3>
            {state.blocked.length ? (
              <ul className="divide-y divide-slate-100">
                {state.blocked.map((id) => { const p = get(id); return p && (
                  <li key={id} className="flex items-center gap-3 py-2"><Avatar person={p} size="sm" /><span className="flex-1 text-sm font-medium">{p.name}</span><Button size="sm" variant="secondary" onClick={() => actions.unblock(id)}>Unblock</Button></li>
                ); })}
              </ul>
            ) : <p className="text-sm text-ink-500">You haven't blocked anyone. You can block or report someone from the ••• menu on their profile.</p>}
            {state.reports.length > 0 && <p className="mt-3 text-xs text-ink-500">{state.reports.length} report{state.reports.length > 1 ? 's' : ''} submitted (stored locally in this prototype).</p>}
          </section>

          {/* Data */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold"><Icon name="info" className="h-5 w-5 text-ink-500" />About this prototype</h3>
            <ul className="space-y-1.5 text-sm text-ink-700">
              <li>• All employees, events and requests are <b>fictional demo data</b>.</li>
              <li>• Your changes are stored only in this browser (localStorage). Nothing is sent to a server.</li>
              <li>• No corporate sign-in, HR system, calendar or Microsoft Teams integration is active.</li>
              <li>• Colleague responses (accepting requests or coffee invites) are simulated.</li>
            </ul>
            <Button variant="danger" size="sm" icon="refresh" className="mt-4" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
          </section>
        </div>
      </div>

      {/* Save bar */}
      <div className={cx('fixed inset-x-0 bottom-16 z-30 px-4 transition-all duration-300 lg:bottom-6 lg:left-64', dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl bg-ink-900 px-5 py-3 text-white shadow-lift">
          <span className="text-sm">You have unsaved changes</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setDraft(state.me)}>Discard</Button>
            <Button size="sm" variant="accent" icon="check" onClick={save}>Save profile</Button>
          </div>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} size="sm" title="Reset all demo data?"
        footer={<><Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { setConfirmReset(false); actions.reset(); }}>Reset</Button></>}>
        <p className="p-6 text-sm text-ink-700">This restores the original fictional data and clears your profile edits, connections, communities and registrations in this browser.</p>
      </Modal>
    </div>
  );
}
