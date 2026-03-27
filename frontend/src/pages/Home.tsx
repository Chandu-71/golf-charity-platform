import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Target, Heart, Sparkles, Ticket, Trophy, ShieldCheck } from 'lucide-react';

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

export function Home() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost:5000/api/charities');
        if (!res.ok) {
          throw new Error(`Failed to load charities (${res.status})`);
        }
        const json = (await res.json()) as Charity[];
        if (!cancelled) setCharities(Array.isArray(json) ? json : []);
      } catch (e) {
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
        icon: <BadgeCheck className='h-5 w-5' />,
        title: 'Subscribe monthly',
        body: 'One subscription. Transparent impact. No gimmicks.',
      },
      {
        icon: <Trophy className='h-5 w-5' />,
        title: 'Track scores (1–45)',
        body: 'Log Stableford scores and keep only your latest five.',
      },
      {
        icon: <Ticket className='h-5 w-5' />,
        title: 'Win monthly draws',
        body: 'Your participation funds a prize pool—draws run every month.',
      },
      {
        icon: <Heart className='h-5 w-5' />,
        title: 'Choose your charity',
        body: 'Direct a portion of your subscription to a cause you care about.',
      },
    ],
    [],
  );

  return (
    <div>
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(700px_circle_at_80%_0%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(700px_circle_at_50%_90%,rgba(236,72,153,0.16),transparent_55%)]' />
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black' />

        <div className='relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:pt-20 sm:pb-14'>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200'>
            <Sparkles className='h-4 w-4' />A charity-first subscription platform
          </div>

          <div className='mt-6 grid gap-10 lg:grid-cols-12 lg:items-start'>
            <div className='lg:col-span-7'>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white'>
                Not a golf website.
                <span className='block text-zinc-300'>A monthly habit that turns scores into support.</span>
              </h1>

              <p className='mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl'>
                Subscribe. Track your Stableford scores (1–45). Get entries into monthly draws. Choose a charity and watch your percentage translate
                into real-world impact.
              </p>

              <div id='subscribe' className='mt-8 flex flex-col sm:flex-row gap-3 sm:items-center'>
                <a
                  href='#charities'
                  className='inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors'
                >
                  Subscribe Now
                </a>
                <div className='inline-flex items-center gap-2 text-sm text-zinc-300'>
                  <ShieldCheck className='h-4 w-4 text-zinc-200' />
                  Secure auth + payments powered by Supabase and Stripe
                </div>
              </div>
            </div>

            <div className='lg:col-span-5'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-semibold text-white'>How it works</div>
                  <div className='text-xs text-zinc-300'>Built for momentum, not tradition</div>
                </div>

                <div className='mt-4 grid gap-3'>
                  {featureCards.map(f => (
                    <div key={f.title} className='flex gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4'>
                      <div className='mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 text-white'>
                        {f.icon}
                      </div>
                      <div>
                        <div className='text-sm font-semibold text-white'>{f.title}</div>
                        <div className='mt-1 text-sm text-zinc-300'>{f.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ fontFamily: "'DM Sans', sans-serif" }} className='bg-[#0a0c0b] text-[#e8e4db] px-10 py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-5xl mx-auto'>
          {/* Left: Text */}
          <div>
            <p className='text-[11px] tracking-[.18em] uppercase text-[#8a9c7e] font-medium mb-5'>Membership benefits</p>
            <h2 className='font-serif text-5xl leading-tight font-normal text-[#f0ece2]'>
              A round that <em className='italic text-[#b8c9a3]'>means something more.</em>
            </h2>

            <div className='mt-11 flex flex-col'>
              {[
                {
                  n: '01',
                  title: 'Score Tracking',
                  desc: 'Log your latest 5 Stableford scores. Clean, private, always up to date.',
                },
                {
                  n: '02',
                  title: 'Monthly Prize Draws',
                  desc: 'Every subscriber enters automatically. Match 3, 4, or 5 numbers to win from the prize pool.',
                },
                {
                  n: '03',
                  title: 'Charity of Your Choice',
                  desc: '10% of your subscription goes directly to the cause you select. Every month, without exception.',
                },
              ].map(f => (
                <div key={f.n} className='flex items-start gap-5 py-5 border-b border-[#1e2420] first:border-t first:border-[#1e2420]'>
                  <span className='text-[11px] text-[#4d6644] tracking-widest pt-0.5 min-w-[24px] font-serif'>{f.n}</span>
                  <div>
                    <h3 className='text-sm font-medium text-[#e8e4db] tracking-wide mb-1'>{f.title}</h3>
                    <p className='text-[13px] text-[#6b7c65] leading-relaxed font-light'>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image + Stat Card */}
          <div className='relative'>
            <div className='rounded-sm overflow-hidden' style={{ aspectRatio: '4/5' }}>
              <img
                src='https://images.unsplash.com/photo-1535139262971-c51845709a48?q=80&w=800&auto=format&fit=crop'
                alt='Golf course'
                className='w-full h-full object-cover brightness-75 contrast-105 saturate-50'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-[#0a0c0b] via-transparent to-transparent' />
            </div>

            {/* Floating stat card */}
            <div className='absolute -bottom-7 -left-8 bg-[#0f1510] border border-[#2a3428] rounded-sm p-6 w-52'>
              <p className='text-[10px] tracking-widest uppercase text-[#4d6644] font-medium mb-3'>This month's pool</p>
              <p className='font-serif text-4xl text-[#f0ece2] font-normal leading-none mb-2'>£4.2k</p>
              <p className='text-[11px] text-[#4d6644] tracking-wide'>248 subscribers entered</p>
              <div className='w-8 h-px bg-[#2a3428] my-3' />
              <p className='font-serif italic text-xs text-[#6b7c65] leading-relaxed'>"Every bogey feels like it's for a better cause."</p>
            </div>
          </div>
        </div>
      </section>
      <section id='charities' className='mx-auto max-w-7xl px-4 py-12'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-semibold text-white tracking-tight'>Pick the cause. We’ll handle the habit.</h2>
            <p className='mt-2 text-zinc-300 max-w-2xl'>Browse charities below. Your plan can direct a percentage to the one you choose.</p>
          </div>
          <div className='hidden sm:flex items-center gap-2 text-sm text-zinc-300'>
            <Trophy className='h-4 w-4' />
            Monthly draw entries included
          </div>
        </div>

        <div className='mt-8'>
          {loading ? (
            <div className='rounded-3xl border border-white/10 bg-white/5 p-6 text-zinc-300'>Loading charities…</div>
          ) : error ? (
            <div className='rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100'>{error}</div>
          ) : charities.length === 0 ? (
            <div className='rounded-3xl border border-white/10 bg-white/5 p-6 text-zinc-300'>No charities found yet.</div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {charities.map(c => (
                <div key={c.id} className='group rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/7 transition-colors'>
                  <div className='flex items-start gap-3'>
                    <div className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white'>
                      <Heart className='h-5 w-5' />
                    </div>
                    <div className='min-w-0'>
                      <div className='text-base font-semibold text-white truncate'>{c.name}</div>
                      <div className='mt-1 text-sm text-zinc-300 line-clamp-3'>{c.description || 'Support this charity with your plan.'}</div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-xs text-zinc-400'>Verified charity partner</div>
                    <a href='#subscribe' className='text-sm font-semibold text-white hover:text-zinc-100'>
                      Subscribe →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
