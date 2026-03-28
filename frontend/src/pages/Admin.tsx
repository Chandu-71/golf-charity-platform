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

type WinnerClaimRow = {
  id: string;
  draw_id: string;
  user_id: string;
  proof_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid';
};

type CharityFormState = {
  id: string;
  name: string;
  description: string;
  image_url: string;
};

export function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [drawLoading, setDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [latestDraw, setLatestDraw] = useState<DrawRow | null>(null);
  const [drawCompleted, setDrawCompleted] = useState(false);

  const [winnerClaims, setWinnerClaims] = useState<WinnerClaimRow[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const [claimActionLoadingById, setClaimActionLoadingById] = useState<Record<string, boolean>>({});

  const [charities, setCharities] = useState<any[]>([]);
  const [charityForm, setCharityForm] = useState<CharityFormState>({ id: '', name: '', description: '', image_url: '' });
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  const [charitiesError, setCharitiesError] = useState<string | null>(null);
  const [charitySaveLoading, setCharitySaveLoading] = useState(false);

  useEffect(() => {
    async function fetchInitialAdminData() {
      setUsersLoading(true);
      setUsersError(null);
      setCharitiesError(null);

      const usersPromise = (async () => {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
        const data = (await res.json()) as UserRow[];
        setUsers(Array.isArray(data) ? data : []);
      })();

      const charitiesPromise = (async () => {
        const { data, error } = await supabase.from('charities').select('id, name, description, image_url').order('name', { ascending: true });

        if (error) throw new Error(error.message || 'Failed to fetch charities');
        setCharities(data ?? []);
      })();

      const [usersResult, charitiesResult] = await Promise.allSettled([usersPromise, charitiesPromise]);

      if (usersResult.status === 'rejected') {
        setUsersError(usersResult.reason instanceof Error ? usersResult.reason.message : 'Failed to fetch users');
      }

      if (charitiesResult.status === 'rejected') {
        setCharitiesError(charitiesResult.reason instanceof Error ? charitiesResult.reason.message : 'Failed to fetch charities');
      }

      setUsersLoading(false);
    }

    fetchInitialAdminData();
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchWinnerClaims() {
      setClaimsLoading(true);
      setClaimsError(null);

      const { data, error } = await supabase
        .from('winners')
        .select('id, draw_id, user_id, proof_url, verification_status, payment_status')
        .order('id', { ascending: false });

      if (!active) return;

      if (error) {
        setClaimsError(error.message || 'Failed to fetch winner claims');
        setWinnerClaims([]);
      } else {
        setWinnerClaims((data as WinnerClaimRow[]) ?? []);
      }

      setClaimsLoading(false);
    }

    fetchWinnerClaims();

    return () => {
      active = false;
    };
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

  async function updateWinnerClaimStatus(
    claimId: string,
    patch: Partial<Pick<WinnerClaimRow, 'verification_status' | 'payment_status'>>,
    fallbackErrorMessage: string,
  ) {
    const previous = winnerClaims.find(claim => claim.id === claimId);
    if (!previous) return;

    setClaimActionLoadingById(prev => ({ ...prev, [claimId]: true }));
    setClaimsError(null);

    // Optimistically update the row so the table reflects the admin action instantly.
    setWinnerClaims(prev => prev.map(claim => (claim.id === claimId ? { ...claim, ...patch } : claim)));

    const { error } = await supabase.from('winners').update(patch).eq('id', claimId);

    if (error) {
      setWinnerClaims(prev => prev.map(claim => (claim.id === claimId ? previous : claim)));
      setClaimsError(error.message || fallbackErrorMessage);
    }

    setClaimActionLoadingById(prev => ({ ...prev, [claimId]: false }));
  }

  async function handleApprove(claimId: string) {
    await updateWinnerClaimStatus(
      claimId,
      {
        verification_status: 'approved',
      },
      'Failed to approve claim',
    );
  }

  async function handleReject(claimId: string) {
    await updateWinnerClaimStatus(
      claimId,
      {
        verification_status: 'rejected',
      },
      'Failed to reject claim',
    );
  }

  async function handleMarkPaid(claimId: string) {
    await updateWinnerClaimStatus(
      claimId,
      {
        payment_status: 'paid',
      },
      'Failed to mark claim as paid',
    );
  }

  function resetCharityForm() {
    setCharityForm({ id: '', name: '', description: '', image_url: '' });
    setIsEditingCharity(false);
  }

  function handleEditCharity(charity: any) {
    setCharityForm({
      id: charity.id,
      name: charity.name ?? '',
      description: charity.description ?? '',
      image_url: charity.image_url ?? '',
    });
    setIsEditingCharity(true);
    setCharitiesError(null);
  }

  async function handleSaveCharity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      name: charityForm.name.trim(),
      description: charityForm.description.trim(),
      image_url: charityForm.image_url.trim(),
    };

    if (!payload.name || !payload.description) {
      setCharitiesError('Name and description are required');
      return;
    }

    setCharitySaveLoading(true);
    setCharitiesError(null);

    if (isEditingCharity) {
      const previous = [...charities];

      // Optimistically update local rows so edits appear instantly.
      setCharities(prev =>
        prev.map(charity =>
          charity.id === charityForm.id
            ? {
                ...charity,
                ...payload,
              }
            : charity,
        ),
      );

      const { error } = await supabase.from('charities').update(payload).eq('id', charityForm.id);

      if (error) {
        setCharities(previous);
        setCharitiesError(error.message || 'Failed to update charity');
      } else {
        resetCharityForm();
      }

      setCharitySaveLoading(false);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticCharity = { id: tempId, ...payload };

    // Optimistically insert the new item into local state first.
    setCharities(prev => [optimisticCharity, ...prev]);

    const { data, error } = await supabase.from('charities').insert([payload]).select('id, name, description, image_url').single();

    if (error) {
      setCharities(prev => prev.filter(charity => charity.id !== tempId));
      setCharitiesError(error.message || 'Failed to create charity');
    } else {
      setCharities(prev => prev.map(charity => (charity.id === tempId ? data : charity)));
      resetCharityForm();
    }

    setCharitySaveLoading(false);
  }

  async function handleDeleteCharity(id: string) {
    const shouldDelete = window.confirm('Are you sure you want to delete this charity?');
    if (!shouldDelete) return;

    const previous = [...charities];
    setCharitiesError(null);

    // Remove locally first for a responsive delete interaction.
    setCharities(prev => prev.filter(charity => charity.id !== id));

    const { error } = await supabase.from('charities').delete().eq('id', id);

    if (error) {
      setCharities(previous);
      setCharitiesError(error.message || 'Failed to delete charity');
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

        <section className='rounded-2xl border border-gray-800 bg-gray-900 p-6'>
          <div className='flex items-center gap-2 text-white'>
            <ShieldCheck className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>Winner Verification</h2>
          </div>
          <p className='mt-2 text-sm text-gray-400'>Review submitted proof images, then verify and mark payouts.</p>

          {claimsError ? (
            <div className='mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200'>{claimsError}</div>
          ) : null}

          {claimsLoading ? (
            <div className='mt-5 text-sm text-gray-400'>Loading winner claims...</div>
          ) : winnerClaims.length === 0 ? (
            <div className='mt-5 text-sm text-gray-400'>No winner claims have been submitted yet.</div>
          ) : (
            <div className='mt-5 overflow-x-auto'>
              <table className='w-full min-w-[840px] text-sm'>
                <thead>
                  <tr className='border-b border-gray-800 text-gray-300'>
                    <th className='py-2 pr-4 text-left font-medium'>Draw ID</th>
                    <th className='py-2 pr-4 text-left font-medium'>User ID</th>
                    <th className='py-2 pr-4 text-left font-medium'>Proof</th>
                    <th className='py-2 pr-4 text-left font-medium'>Verification Status</th>
                    <th className='py-2 pr-4 text-left font-medium'>Payment Status</th>
                    <th className='py-2 text-left font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winnerClaims.map(claim => (
                    <tr key={claim.id} className='border-b border-gray-800/80 text-gray-200'>
                      <td className='py-3 pr-4 font-mono text-xs'>{claim.draw_id.slice(0, 8)}</td>
                      <td className='py-3 pr-4 font-mono text-xs'>{claim.user_id.slice(0, 8)}</td>
                      <td className='py-3 pr-4'>
                        <a
                          href={claim.proof_url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-cyan-300 hover:text-cyan-200 underline underline-offset-2'
                        >
                          View Proof
                        </a>
                      </td>
                      <td className='py-3 pr-4 capitalize'>{claim.verification_status}</td>
                      <td className='py-3 pr-4 capitalize'>{claim.payment_status}</td>
                      <td className='py-3'>
                        <div className='flex flex-wrap gap-2'>
                          <button
                            type='button'
                            onClick={() => handleApprove(claim.id)}
                            disabled={Boolean(claimActionLoadingById[claim.id]) || claim.verification_status === 'approved'}
                            className='rounded-md border border-emerald-600/40 bg-emerald-700/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-700/30 disabled:opacity-50'
                          >
                            Approve
                          </button>
                          <button
                            type='button'
                            onClick={() => handleReject(claim.id)}
                            disabled={Boolean(claimActionLoadingById[claim.id]) || claim.verification_status === 'rejected'}
                            className='rounded-md border border-rose-600/40 bg-rose-700/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-700/30 disabled:opacity-50'
                          >
                            Reject
                          </button>
                          {claim.verification_status === 'approved' ? (
                            <button
                              type='button'
                              onClick={() => handleMarkPaid(claim.id)}
                              disabled={Boolean(claimActionLoadingById[claim.id]) || claim.payment_status === 'paid'}
                              className='rounded-md border border-amber-600/40 bg-amber-700/20 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-700/30 disabled:opacity-50'
                            >
                              Mark Paid
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className='rounded-2xl border border-gray-800 bg-gray-900 p-6'>
          <div className='flex items-center gap-2 text-white'>
            <ShieldCheck className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>Charity Management</h2>
          </div>
          <p className='mt-2 text-sm text-gray-400'>Create, update, and remove charities shown to members.</p>

          {charitiesError ? (
            <div className='mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200'>{charitiesError}</div>
          ) : null}

          <form onSubmit={handleSaveCharity} className='mt-5 bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='md:col-span-2'>
                <label htmlFor='charity-name' className='mb-2 block text-sm font-medium text-gray-300'>
                  Name
                </label>
                <input
                  id='charity-name'
                  type='text'
                  value={charityForm.name}
                  onChange={e => setCharityForm(prev => ({ ...prev, name: e.target.value }))}
                  className='w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-gray-500'
                  placeholder='Charity name'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label htmlFor='charity-description' className='mb-2 block text-sm font-medium text-gray-300'>
                  Description
                </label>
                <textarea
                  id='charity-description'
                  value={charityForm.description}
                  onChange={e => setCharityForm(prev => ({ ...prev, description: e.target.value }))}
                  className='w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-gray-500 min-h-[120px]'
                  placeholder='What does this charity do?'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label htmlFor='charity-image-url' className='mb-2 block text-sm font-medium text-gray-300'>
                  Image URL
                </label>
                <input
                  id='charity-image-url'
                  type='url'
                  value={charityForm.image_url}
                  onChange={e => setCharityForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className='w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-gray-500'
                  placeholder='https://...'
                />
              </div>
            </div>

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                type='submit'
                disabled={charitySaveLoading}
                className='rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-60'
              >
                {charitySaveLoading ? 'Saving...' : isEditingCharity ? 'Update Charity' : 'Add Charity'}
              </button>

              {isEditingCharity ? (
                <button
                  type='button'
                  onClick={resetCharityForm}
                  className='rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800'
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className='bg-gray-900 border border-gray-800 p-6 rounded-2xl'>
            {charities.length === 0 ? (
              <div className='text-sm text-gray-400'>No charities available yet.</div>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {charities.map(charity => (
                  <div key={charity.id} className='rounded-xl border border-gray-800 bg-black/40 p-4'>
                    {charity.image_url ? (
                      <img src={charity.image_url} alt={charity.name} className='mb-3 h-40 w-full rounded-lg object-cover border border-gray-800' />
                    ) : null}
                    <h3 className='text-base font-semibold text-white'>{charity.name}</h3>
                    <p className='mt-2 text-sm text-gray-300'>{charity.description}</p>

                    <div className='mt-4 flex gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEditCharity(charity)}
                        className='rounded-md border border-gray-600 bg-gray-700/40 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-700/60'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteCharity(charity.id)}
                        className='rounded-md border border-rose-600/40 bg-rose-700/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-700/30'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
