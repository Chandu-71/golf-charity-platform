import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Trophy, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type UserRow = {
  id: string;
  plan: string | null;
  charity_percentage: number | null;
};

type DrawRow = {
  id: string;
  month_year: string;
  winning_numbers: number[];
  status: string;
};

export function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [drawLoading, setDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [latestDraw, setLatestDraw] = useState<DrawRow | null>(null);
  const [drawCompleted, setDrawCompleted] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setUsersLoading(true);
      setUsersError(null);

      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
        const data = (await res.json()) as UserRow[];
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setUsersError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setUsersLoading(false);
      }
    }

    fetchUsers();
  }, []);

  async function runMonthlyDraw() {
    setDrawLoading(true);
    setDrawError(null);
    setDrawCompleted(false);

    try {
      const res = await fetch('/api/admin/draws/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Draw failed (${res.status})`);
      const draw = (await res.json()) as DrawRow;
      setLatestDraw(draw);
      setDrawCompleted(true);
    } catch (err) {
      setDrawError(err instanceof Error ? err.message : 'Failed to run draw');
    } finally {
      setDrawLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-10 sm:py-12'>
      <div className='grid gap-6'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
          <div className='flex items-center gap-3'>
            <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white'>
              <ShieldCheck className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight text-white'>Admin Control Center</h1>
              <p className='mt-1 text-sm text-zinc-300'>Manage members and run the monthly prize draw.</p>
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          <section className='rounded-3xl border border-white/10 bg-white/5 p-6'>
            <div className='flex items-center gap-2 text-white'>
              <Trophy className='h-5 w-5' />
              <h2 className='text-lg font-semibold'>Draw Engine</h2>
            </div>
            <p className='mt-2 text-sm text-zinc-300'>Publish this month&apos;s five winning numbers instantly.</p>

            <button
              type='button'
              onClick={runMonthlyDraw}
              disabled={drawLoading}
              className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60 transition-colors'
            >
              <Sparkles className='h-4 w-4' />
              {drawLoading ? 'Running Draw...' : 'Run Monthly Draw'}
            </button>

            {drawError ? (
              <div className='mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100'>{drawError}</div>
            ) : null}
            {drawCompleted ? (
              <div className='mt-4 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-500/20 px-4 py-3 text-base font-bold text-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.25)]'>
                Draw Completed!
              </div>
            ) : null}

            <div className='mt-5 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-400/20 via-zinc-900/80 to-yellow-300/15 p-4 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]'>
              <div className='text-sm font-semibold tracking-wide text-amber-200'>Latest Winning Numbers</div>
              {latestDraw ? (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {latestDraw.winning_numbers.map(n => (
                    <span
                      key={n}
                      className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 text-zinc-950 font-extrabold shadow-[0_0_18px_rgba(252,211,77,0.65)]'
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <div className='mt-2 text-sm text-zinc-400'>No draw generated yet in this session.</div>
              )}
            </div>
          </section>

          <section className='rounded-3xl border border-white/10 bg-white/5 p-6'>
            <div className='flex items-center gap-2 text-white'>
              <Users className='h-5 w-5' />
              <h2 className='text-lg font-semibold'>User Management</h2>
            </div>
            <p className='mt-2 text-sm text-zinc-300'>View registered members and their subscription settings.</p>

            {usersLoading ? (
              <div className='mt-5 text-sm text-zinc-300'>Loading users...</div>
            ) : usersError ? (
              <div className='mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100'>{usersError}</div>
            ) : (
              <div className='mt-5 overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-white/10 text-zinc-300'>
                      <th className='py-2 pr-4 text-left font-medium'>User ID</th>
                      <th className='py-2 pr-4 text-left font-medium'>Plan</th>
                      <th className='py-2 text-left font-medium'>Charity %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className='border-b border-white/5 text-zinc-200'>
                        <td className='py-3 pr-4 font-mono text-xs'>{u.id.substring(0, 8)}</td>
                        <td className='py-3 pr-4'>{u.plan ?? '-'}</td>
                        <td className='py-3'>{u.charity_percentage ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
