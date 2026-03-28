import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ProfileRow = {
  role: string | null;
  subscription_status: string | null;
};

export function Profile() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        const currentUser = session?.user;

        if (!currentUser) {
          if (active) {
            setEmail('');
            setRole('user');
            setSubscriptionStatus('inactive');
          }
          return;
        }

        if (active) {
          setEmail(currentUser.email ?? '');
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, subscription_status')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!active) return;

        const typedProfile = profile as ProfileRow | null;
        setRole((typedProfile?.role ?? 'user').toLowerCase());
        setSubscriptionStatus((typedProfile?.subscription_status ?? 'inactive').toLowerCase());
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile settings.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const roleLabel = role === 'admin' ? 'Admin' : 'User';
  const isActiveSubscription = subscriptionStatus === 'active';

  return (
    <div className='max-w-4xl mx-auto px-4 py-12 text-white'>
      <div className='mb-8'>
        <p className='text-sm uppercase tracking-wide text-gray-500'>Account Settings</p>
        <h1 className='mt-2 text-3xl sm:text-4xl font-bold'>My Profile</h1>
      </div>

      {error ? <div className='mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'>{error}</div> : null}

      {loading ? (
        <div className='rounded-xl bg-gray-900 border border-gray-800 p-6 text-gray-400'>Loading profile...</div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2'>
          <section className='bg-gray-900 border border-gray-800 rounded-xl p-6'>
            <div className='flex items-center gap-3'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-300'>
                <User size={20} />
              </div>
              <div>
                <h2 className='text-lg font-semibold'>Account Details</h2>
                <p className='text-sm text-gray-400'>Your identity and account role</p>
              </div>
            </div>

            <div className='mt-6'>
              <p className='text-xs uppercase tracking-wide text-gray-500'>Email</p>
              <input
                type='text'
                value={email}
                disabled
                className='mt-2 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-300'
              />
            </div>

            <div className='mt-5'>
              <p className='text-xs uppercase tracking-wide text-gray-500'>Role</p>
              <span className='mt-2 inline-flex rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-200'>{roleLabel}</span>
            </div>
          </section>

          <section className='bg-gray-900 border border-gray-800 rounded-xl p-6'>
            <h2 className='text-lg font-semibold'>Subscription</h2>
            <p className='mt-1 text-sm text-gray-400'>Your current membership status</p>

            <div className='mt-6'>
              <p className='text-xs uppercase tracking-wide text-gray-500'>Status</p>
              {isActiveSubscription ? (
                <p className='mt-2 text-lg font-semibold text-emerald-400'>Active</p>
              ) : (
                <p className='mt-2 text-lg font-semibold text-amber-400'>Inactive</p>
              )}
            </div>

            <div className='mt-6'>
              {isActiveSubscription ? (
                <p className='text-sm text-gray-400'>Your subscription is active and fully unlocked.</p>
              ) : (
                <Link
                  to='/checkout'
                  className='inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors'
                >
                  Go to Checkout
                </Link>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
