import { useEffect, useState } from 'react';
import { Calendar, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type DrawRecord = {
  id: string;
  created_at: string;
  month_year: string;
  winning_numbers: number[];
  status?: string;
};

type WinnerClaim = {
  id: string;
  draw_id: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid';
};

export function Results() {
  const { user } = useAuth();
  const [draws, setDraws] = useState<DrawRecord[]>([]);
  const [userClaims, setUserClaims] = useState<Record<string, any>>({});
  const [activeClaimDrawId, setActiveClaimDrawId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [claimSubmittingByDraw, setClaimSubmittingByDraw] = useState<Record<string, boolean>>({});
  const [claimErrorsByDraw, setClaimErrorsByDraw] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const response = await fetch('/api/draws');
        if (!response.ok) throw new Error(`Network response was not ok`);
        const data = await response.json();
        setDraws(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching draws:', error);
        setDraws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchClaims() {
      if (!user) {
        if (!cancelled) setUserClaims({});
        return;
      }

      const { data, error } = await supabase.from('winners').select('id, draw_id, verification_status, payment_status').eq('user_id', user.id);

      if (cancelled) return;

      if (error) {
        console.error('Failed to load winner claims', error);
        setUserClaims({});
        return;
      }

      const mappedClaims = ((data as WinnerClaim[]) ?? []).reduce<Record<string, WinnerClaim>>((acc, claim) => {
        acc[claim.draw_id] = claim;
        return acc;
      }, {});

      setUserClaims(mappedClaims);
    }

    fetchClaims();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const claimsChannel = supabase
      .channel(`winner-claims-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'winners',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          const incomingClaim = payload.new as WinnerClaim;
          if (!incomingClaim?.draw_id) return;

          setUserClaims(prev => ({
            ...prev,
            [incomingClaim.draw_id]: incomingClaim,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(claimsChannel);
    };
  }, [user]);

  function renderClaimStatusBadge(claim: WinnerClaim) {
    if (claim.verification_status === 'pending') {
      return (
        <span className='inline-flex rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200'>
          Review Pending ⏳
        </span>
      );
    }

    if (claim.verification_status === 'rejected') {
      return (
        <span className='inline-flex rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200'>
          Claim Rejected ❌
        </span>
      );
    }

    if (claim.verification_status === 'approved' && claim.payment_status === 'pending') {
      return (
        <span className='inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200'>
          Approved! Awaiting Payment 💸
        </span>
      );
    }

    if (claim.verification_status === 'approved' && claim.payment_status === 'paid') {
      return (
        <span className='inline-flex rounded-full border border-lime-400/50 bg-lime-500/15 px-3 py-1 text-xs font-semibold text-lime-200'>
          Prize Paid! 🎉
        </span>
      );
    }

    return null;
  }

  async function handleClaimSubmit(drawId: string, file: File | null) {
    if (!user) {
      setClaimErrorsByDraw(prev => ({ ...prev, [drawId]: 'Please sign in to submit a claim.' }));
      return;
    }

    if (!file) {
      setClaimErrorsByDraw(prev => ({ ...prev, [drawId]: 'Please select an image proof before submitting.' }));
      return;
    }

    setClaimSubmittingByDraw(prev => ({ ...prev, [drawId]: true }));
    setClaimErrorsByDraw(prev => ({ ...prev, [drawId]: '' }));

    try {
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
      const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? `.${extension}` : '';
      const fileName = `${user.id}-${Date.now()}${safeExtension}`;

      const { error: uploadError } = await supabase.storage.from('proofs').upload(fileName, file, {
        upsert: false,
        contentType: file.type || undefined,
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(fileName);
      const proofUrl = urlData.publicUrl;

      const { data: insertedClaim, error: insertError } = await supabase
        .from('winners')
        .insert({
          draw_id: drawId,
          user_id: user.id,
          proof_url: proofUrl,
        })
        .select('id, draw_id, verification_status, payment_status')
        .single();

      if (insertError) throw insertError;

      const typedClaim = insertedClaim as WinnerClaim;
      setUserClaims(prev => ({ ...prev, [typedClaim.draw_id]: typedClaim }));
      setSelectedFiles(prev => ({ ...prev, [drawId]: null }));
      setActiveClaimDrawId(null);
    } catch (error) {
      console.error('Claim submission failed', error);
      setClaimErrorsByDraw(prev => ({
        ...prev,
        [drawId]: error instanceof Error ? error.message : 'Failed to submit claim. Please try again.',
      }));
    } finally {
      setClaimSubmittingByDraw(prev => ({ ...prev, [drawId]: false }));
    }
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-24 text-white'>
      <div className='text-center'>
        <p className='text-sm uppercase tracking-wider text-gray-500'>RESULTS CENTER</p>
        <h1 className='mt-4 text-4xl sm:text-5xl font-bold text-white'>Monthly Draw Results</h1>
        <p className='mt-4 mx-auto max-w-2xl text-gray-400'>Verify the latest winning numbers and jackpot distributions.</p>
      </div>

      <div className='mt-12'>
        {loading ? (
          <p className='text-gray-400'>Loading results...</p>
        ) : draws.length === 0 ? (
          <p className='text-gray-400'>No draw data available yet.</p>
        ) : (
          draws.map(draw => {
            const claim = userClaims[draw.id] as WinnerClaim | undefined;
            const rawDate = draw.created_at || (draw as any).date;
            const dateObj = rawDate ? new Date(rawDate) : new Date();
            const isValidDate = !Number.isNaN(dateObj.getTime());

            const month = isValidDate ? dateObj.toLocaleString('default', { month: 'short' }).toUpperCase() : '---';
            const day = isValidDate ? dateObj.getDate().toString().padStart(2, '0') : '--';
            const year = isValidDate ? dateObj.getFullYear() : '----';

            return (
              <div
                key={draw.id}
                className='bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 hover:border-gray-700 transition-colors'
              >
                <div className='flex flex-col md:flex-row items-center gap-6'>
                  <div className='bg-gray-950 border border-gray-800 rounded-xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px] shadow-inner'>
                    <p className='text-sm uppercase tracking-wide text-gray-400'>{month}</p>
                    <p className='text-4xl font-bold'>{day}</p>
                    <p className='text-xs text-gray-400'>{year}</p>
                  </div>

                  <div className='flex flex-wrap justify-center items-center gap-3'>
                    {draw.winning_numbers.map(num => (
                      <span
                        key={num}
                        className='w-12 h-12 rounded-full bg-black border border-gray-700 flex items-center justify-center text-lg font-bold text-white shadow-inner'
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='flex flex-col items-center md:items-end gap-4 w-full md:w-auto text-center md:text-right'>
                  <div>
                    <p className='text-sm font-semibold text-gray-400 tracking-wider uppercase'>JACKPOT POOL</p>
                    <p className='text-3xl md:text-4xl font-extrabold text-white'>£10,000</p>
                  </div>

                  {user && !claim ? (
                    <div className='w-full'>
                      <button
                        type='button'
                        onClick={() => {
                          setActiveClaimDrawId(prev => (prev === draw.id ? null : draw.id));
                          setClaimErrorsByDraw(prev => ({ ...prev, [draw.id]: '' }));
                        }}
                        className='w-full md:w-auto px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300'
                      >
                        Claim Win
                      </button>
                    </div>
                  ) : null}

                  {claim ? <div className='mt-3'>{renderClaimStatusBadge(claim)}</div> : null}

                  {activeClaimDrawId === draw.id && user && !claim ? (
                    <div className='w-full border-t border-gray-800 pt-4'>
                      <div className='flex items-center gap-3 bg-gray-950 p-2 rounded-xl border border-gray-800'>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={event => {
                            const file = event.target.files?.[0] ?? null;
                            setSelectedFiles(prev => ({ ...prev, [draw.id]: file }));
                          }}
                          className='block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer'
                        />
                        <button
                          type='button'
                          onClick={() => handleClaimSubmit(draw.id, selectedFiles[draw.id] ?? null)}
                          disabled={Boolean(claimSubmittingByDraw[draw.id])}
                          className='px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap disabled:opacity-60'
                        >
                          {claimSubmittingByDraw[draw.id] ? 'Submitting...' : 'Submit Claim'}
                        </button>
                      </div>

                      {claimErrorsByDraw[draw.id] ? <p className='mt-2 text-sm text-rose-300 text-left'>{claimErrorsByDraw[draw.id]}</p> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='mt-16 pt-16 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='flex flex-col gap-3'>
          <div className='inline-flex items-center gap-2 text-amber-300'>
            <Trophy className='h-5 w-5' />
            <p className='text-sm font-semibold'>How to Win</p>
          </div>
          <p className='text-gray-400'>Match 3, 4, or 5 numbers from your registered score to win a share of the pool.</p>
        </div>

        <div className='flex flex-col gap-3'>
          <div className='inline-flex items-center gap-2 text-cyan-300'>
            <Calendar className='h-5 w-5' />
            <p className='text-sm font-semibold'>Draw Schedule</p>
          </div>
          <p className='text-gray-400'>Draws are executed automatically on the 1st of every month.</p>
        </div>

        <div className='flex flex-col gap-3'>
          <div className='inline-flex items-center gap-2 text-lime-300'>
            <ShieldCheck className='h-5 w-5' />
            <p className='text-sm font-semibold'>Verify Results</p>
          </div>
          <p className='text-gray-400'>All draws are cryptographically secured and independently auditable.</p>
        </div>
      </div>
    </div>
  );
}
