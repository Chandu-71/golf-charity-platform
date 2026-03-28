import { useEffect, useState } from 'react';
import { Calendar, ShieldCheck, Trophy } from 'lucide-react';

type DrawRecord = {
  id: string;
  created_at: string;
  month_year: string;
  winning_numbers: number[];
  status?: string;
};

export function Results() {
  const [draws, setDraws] = useState<DrawRecord[]>([]);
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
            const rawDate = draw.created_at || (draw as any).date;
            const dateObj = rawDate ? new Date(rawDate) : new Date();
            const isValidDate = !Number.isNaN(dateObj.getTime());

            const month = isValidDate ? dateObj.toLocaleString('default', { month: 'short' }).toUpperCase() : '---';
            const day = isValidDate ? dateObj.getDate().toString().padStart(2, '0') : '--';
            const year = isValidDate ? dateObj.getFullYear() : '----';

            return (
              <div
                key={draw.id}
                className='bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-start justify-between gap-6 mb-4 hover:border-gray-700 transition'
              >
                <div className='min-w-[120px] min-h-[120px] rounded-xl bg-gray-800 border border-gray-700 flex flex-col items-center justify-center text-white'>
                  <p className='text-sm uppercase tracking-wide text-gray-400'>{month}</p>
                  <p className='text-4xl font-bold'>{day}</p>
                  <p className='text-xs text-gray-400'>{year}</p>
                </div>

                <div className='flex-1 w-full'>
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {draw.winning_numbers.map(num => (
                      <span
                        key={num}
                        className='w-12 h-12 rounded-full bg-black border border-gray-700 flex items-center justify-center text-white font-bold text-lg shadow-inner'
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='text-right'>
                  <p className='text-xs uppercase tracking-wide text-gray-400'>JACKPOT POOL</p>
                  <p className='text-2xl font-bold text-white'>£10,000</p>
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
