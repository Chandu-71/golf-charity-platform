import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Globe2, Heart, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

export function Home() {
  const { user } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ctaTarget = user ? '/dashboard' : '/login';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/charities');
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Failed to load charities (${res.status}): ${body.slice(0, 140)}`);
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const body = await res.text();
          throw new Error(`Expected JSON from /api/charities but got ${contentType || 'unknown'}: ${body.slice(0, 140)}`);
        }

        const json = (await res.json()) as Charity[];
        if (!cancelled) setCharities(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error('/api/charities load failed', e);
        if (!cancelled) setError(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featureCards = useMemo(
    () => [
      {
        icon: <Globe2 className='h-5 w-5' />,
        title: 'Global impact, local intention',
        body: 'Your membership creates a dependable monthly stream for vetted causes.',
      },
      {
        icon: <Activity className='h-5 w-5' />,
        title: 'Purposeful progress',
        body: 'Track your latest score activity in a clean, private member dashboard.',
      },
      {
        icon: <Zap className='h-5 w-5' />,
        title: 'Momentum with rewards',
        body: 'Monthly draws keep engagement high while giving remains consistent.',
      },
      {
        icon: <Heart className='h-5 w-5' />,
        title: 'Choose your mission',
        body: 'Direct part of your subscription to the charity that matters most to you.',
      },
    ],
    [],
  );

  return (
    <div className='bg-black'>
      <section className='relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black'>
        <div className='absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_0%,rgba(148,163,184,0.15),transparent_55%),radial-gradient(700px_circle_at_85%_10%,rgba(34,197,94,0.12),transparent_50%),radial-gradient(800px_circle_at_50%_95%,rgba(59,130,246,0.10),transparent_55%)]' />

        <div className='relative mx-auto max-w-7xl px-4 pt-20 pb-14 sm:pt-24 sm:pb-20'>
          <div className='inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-gray-800 bg-gray-900/70 px-4 py-2 text-xs text-gray-200'>
            <Sparkles className='h-4 w-4 text-emerald-300' />
            Built for impact-first members
          </div>

          <div className='mt-8 grid gap-10 lg:grid-cols-12 lg:items-start'>
            <div className='lg:col-span-7'>
              <h1 className='animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white'>
                Transform Your Game Into Global Impact.
              </h1>

              <p className='animate-fade-in-up mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg [animation-delay:120ms]'>
                Join a modern community of players dedicating a percentage of their passion to causes that matter. Play with purpose.
              </p>

              <div id='subscribe' className='animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row sm:items-center [animation-delay:220ms]'>
                <Link
                  to={ctaTarget}
                  className='inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]'
                >
                  Subscribe & Start Giving
                </Link>
                <div className='inline-flex items-center gap-2 text-sm text-gray-300'>
                  <ShieldCheck className='h-4 w-4 text-gray-200' />
                  Secure auth + payments powered by Supabase and Stripe
                </div>
              </div>
            </div>

            <div className='lg:col-span-5'>
              <div className='rounded-3xl border border-gray-800 bg-gray-900/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-2 hover:border-gray-600 hover:shadow-2xl hover:shadow-gray-800/50'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-semibold text-white'>How it works</div>
                  <div className='text-xs text-gray-300'>Built for momentum, not tradition</div>
                </div>

                <div className='mt-4 grid gap-3'>
                  {featureCards.map(f => (
                    <div
                      key={f.title}
                      className='flex gap-3 rounded-2xl border border-gray-800 bg-black/40 p-5 transition-all duration-300 hover:-translate-y-2 hover:border-gray-600 hover:shadow-2xl hover:shadow-gray-800/50'
                    >
                      <div className='mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-white'>{f.icon}</div>
                      <div>
                        <div className='text-sm font-semibold text-white'>{f.title}</div>
                        <div className='mt-1 text-sm text-gray-300'>{f.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='bg-black px-4 py-20 sm:px-6'>
        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2'>
          <div className='rounded-3xl border border-gray-800 bg-gray-900 p-10 transition-all duration-300 hover:-translate-y-2 hover:border-gray-600 hover:shadow-2xl hover:shadow-gray-800/50'>
            <p className='text-xs uppercase tracking-[0.22em] text-gray-500'>Membership Benefits</p>
            <h2 className='mt-5 text-4xl font-semibold leading-tight text-white'>A clean system for consistent monthly giving.</h2>
            <div className='mt-10 space-y-6'>
              {[
                {
                  n: '01',
                  title: 'Transparent Contribution',
                  desc: 'A fixed share of your membership goes to your selected cause each month.',
                },
                {
                  n: '02',
                  title: 'Member Momentum',
                  desc: 'Stay engaged through monthly draws and an active, purpose-driven community.',
                },
                {
                  n: '03',
                  title: 'Proof of Impact',
                  desc: 'See the community effect of recurring support, not one-off campaigns.',
                },
              ].map(f => (
                <div key={f.n} className='flex items-start gap-4 border-t border-gray-800 pt-5 first:border-t-0 first:pt-0'>
                  <span className='pt-1 text-xs tracking-widest text-gray-500'>{f.n}</span>
                  <div>
                    <h3 className='text-base font-semibold text-gray-100'>{f.title}</h3>
                    <p className='mt-1 text-sm leading-relaxed text-gray-400'>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-10 transition-all duration-300 hover:-translate-y-2 hover:border-gray-600 hover:shadow-2xl hover:shadow-gray-800/50'>
            <div className='rounded-2xl border border-gray-800 bg-black/60 p-8'>
              <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>Community Snapshot</p>
              <div className='mt-6 grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border border-gray-800 bg-gray-900 p-6'>
                  <p className='text-xs text-gray-500'>This Month\'s Pool</p>
                  <p className='mt-2 text-3xl font-semibold text-white'>£4.2k</p>
                </div>
                <div className='rounded-2xl border border-gray-800 bg-gray-900 p-6'>
                  <p className='text-xs text-gray-500'>Members Active</p>
                  <p className='mt-2 text-3xl font-semibold text-white'>248</p>
                </div>
              </div>
              <p className='mt-8 text-sm leading-relaxed text-gray-300'>
                "I joined for the challenge and stayed for the impact. Giving now feels automatic, intentional, and real."
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id='charities' className='mx-auto max-w-7xl px-4 py-12'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-semibold text-white tracking-tight'>Pick the cause. We handle the consistency.</h2>
            <p className='mt-2 max-w-2xl text-gray-300'>
              Browse verified charities below and direct part of your monthly plan where it matters most.
            </p>
          </div>
          <div className='hidden sm:flex items-center gap-2 text-sm text-gray-300'>
            <Zap className='h-4 w-4' />
            Monthly reward entries included
          </div>
        </div>

        <div className='mt-8'>
          {loading ? (
            <div className='rounded-3xl border border-gray-800 bg-gray-900 p-8 text-gray-300'>Loading charities…</div>
          ) : error ? (
            <div className='rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100'>{error}</div>
          ) : charities.length === 0 ? (
            <div className='rounded-3xl border border-gray-800 bg-gray-900 p-8 text-gray-300'>No charities found yet.</div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {charities.map(c => (
                <div
                  key={c.id}
                  className='group rounded-3xl border border-gray-800 bg-gray-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-800/50 hover:border-gray-600'
                >
                  <div className='flex items-start gap-3'>
                    <div className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-800 text-white'>
                      <Heart className='h-5 w-5' />
                    </div>
                    <div className='min-w-0'>
                      <div className='text-base font-semibold text-white truncate'>{c.name}</div>
                      <div className='mt-1 text-sm text-gray-300 line-clamp-3'>{c.description || 'Support this charity with your plan.'}</div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-xs text-gray-400'>Verified charity partner</div>
                    <Link to={ctaTarget} className='text-sm font-semibold text-white hover:text-zinc-100 transition-colors'>
                      Subscribe →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className='px-4'>
        <div className='max-w-5xl mx-auto my-24 p-12 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-3xl relative overflow-hidden text-center'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none' />

          <div className='relative z-10'>
            <h2 className='text-4xl md:text-5xl font-extrabold text-white mb-6'>Ready to Play with Purpose?</h2>
            <p className='text-xl text-gray-400 mb-10 max-w-2xl mx-auto'>
              Join a new generation of players turning their passion into global impact. 10% of your subscription goes directly to world-class
              charities.
            </p>
            <Link
              to={ctaTarget}
              className='inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]'
            >
              Subscribe & Start Giving
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
