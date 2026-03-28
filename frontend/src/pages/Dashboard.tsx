import { useEffect, useState } from 'react';
import { CalendarDays, PlusCircle, Trophy, Wallet, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type ScoreRow = {
  id: string;
  score: number;
  date: string;
};

export function Dashboard() {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [newScore, setNewScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function fetchScores(currentUserId?: string) {
    setLoading(true);
    setError(null);

    let resolvedUserId = currentUserId ?? userId;
    if (!resolvedUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No authenticated user found.');
        setScores([]);
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? '');
      setUserId(user.id);
      resolvedUserId = user.id;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', resolvedUserId)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
    } else {
      setSubscriptionStatus(profileData?.subscription_status ?? 'inactive');
    }

    const { data, error: fetchError } = await supabase.from('scores').select('*').eq('user_id', resolvedUserId).order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setScores([]);
    } else {
      setScores((data as ScoreRow[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitScore(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const scoreNumber = Number(newScore);
    if (!Number.isFinite(scoreNumber) || scoreNumber < 1 || scoreNumber > 45) {
      setError('Score must be a number between 1 and 45.');
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('No authenticated user found.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('scores').insert({
      score: scoreNumber,
      user_id: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setNewScore('');
    await fetchScores(user.id);
    setSuccessMessage('Score submitted successfully!');
    window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  }

  const displayName = userEmail?.split('@')[0] || 'Golfer';

  return (
    <div className='mx-auto max-w-6xl px-4 py-10 sm:py-12'>
      <div className='grid gap-6'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
          <h1 className='text-3xl sm:text-4xl font-bold text-white'>Hello, {displayName}</h1>
          <p className='mt-2 text-gray-400'>Welcome back to your dashboard.</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-gray-900 border border-gray-800 rounded-2xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-sm font-semibold text-gray-300'>Subscription</h2>
                <p className='text-xs text-gray-500'>Manage your membership</p>
              </div>
              <Info className='h-5 w-5 text-gray-400' />
            </div>

            <div className='mt-6'>
              <p className='text-xs text-gray-500'>STATUS</p>
              {subscriptionStatus === 'active' ? (
                <p className='mt-1 text-lg font-bold text-emerald-400'>Active</p>
              ) : (
                <p className='mt-1 text-lg font-bold text-amber-400'>Inactive</p>
              )}
            </div>

            <div className='mt-6'>
              {subscriptionStatus !== 'active' ? (
                <Link
                  to='/checkout'
                  className='inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition-colors'
                >
                  Subscribe Now
                </Link>
              ) : (
                <p className='text-sm text-gray-400'>Thank you for your support.</p>
              )}
            </div>
          </div>

          <div className='bg-black border border-gray-800 rounded-2xl p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-sm font-semibold text-gray-300'>Total Won</h2>
              <Wallet className='h-5 w-5 text-gray-400' />
            </div>

            <p className='mt-6 text-3xl font-bold text-white'>£0</p>
            <p className='text-xs text-gray-500'>Across 0 winning draws</p>

            <Link to='#' className='mt-5 inline-block text-sm text-gray-400 hover:text-white'>
              View History ↗
            </Link>
          </div>

          <div className='bg-gray-900 border border-gray-800 rounded-2xl p-6'>
            <div className='flex items-center gap-2 text-gray-300'>
              <Trophy className='h-5 w-5' />
              <p className='text-sm font-semibold'>NEXT DRAW</p>
            </div>

            <p className='mt-6 text-3xl font-bold text-white'>May 1st, 2026</p>
            <p className='text-xs text-gray-500 mt-1'>Estimated Jackpot: £10,000</p>

            <div className='mt-4 inline-flex items-center gap-2 text-xs text-gray-400'>
              <div className='h-3 w-3 rounded-full bg-gray-500' />
              12,405 participants entered
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
            {subscriptionStatus === 'active' ? (
              <>
                <div className='flex items-center gap-2 text-white'>
                  <PlusCircle className='h-5 w-5' />
                  <h2 className='text-lg font-semibold'>Submit a New Score</h2>
                </div>
                <p className='mt-2 text-sm text-zinc-300'>Enter your Stableford score between 1 and 45.</p>

                <form onSubmit={handleSubmitScore} className='mt-4 grid gap-3'>
                  <input
                    type='number'
                    min='1'
                    max='45'
                    value={newScore}
                    onChange={e => setNewScore(e.target.value)}
                    placeholder='Enter Stableford Score (1-45)'
                    className='w-full rounded-xl border border-white/15 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-white/20'
                    required
                  />
                  <button
                    type='submit'
                    disabled={loading}
                    className='inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60 transition-colors'
                  >
                    Submit Score
                  </button>
                </form>
              </>
            ) : (
              <div className='rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5'>
                <h2 className='text-lg font-semibold text-white'>Unlock Score Tracking & Monthly Draws. Subscribe to support your charity.</h2>
                <Link
                  to='/checkout'
                  className='mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition-colors'
                >
                  Go to Checkout
                </Link>
              </div>
            )}

            {error ? <div className='mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100'>{error}</div> : null}
            {successMessage ? (
              <div className='mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200'>
                {successMessage}
              </div>
            ) : null}
          </div>

          <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
            <div className='flex items-center gap-2 text-white'>
              <Trophy className='h-5 w-5' />
              <h2 className='text-lg font-semibold'>Score History</h2>
            </div>

            {loading ? (
              <p className='mt-4 text-sm text-zinc-300'>Loading scores...</p>
            ) : scores.length === 0 ? (
              <div className='mt-4 rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-4 text-sm text-zinc-300'>
                No scores yet. Add your first Stableford score to start tracking progress.
              </div>
            ) : (
              <ul className='mt-4 space-y-3'>
                {scores.map(entry => (
                  <li key={entry.id} className='flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3'>
                    <div className='text-2xl font-bold text-white'>{entry.score}</div>
                    <div className='inline-flex items-center gap-2 text-sm text-zinc-300'>
                      <CalendarDays className='h-4 w-4' />
                      {new Date(entry.date).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
