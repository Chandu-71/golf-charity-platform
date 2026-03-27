import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

export function Charities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCharities() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('charities').select('id, name, description, image_url');
        if (error) {
          console.error('Failed to fetch charities', error);
          setCharities([]);
        } else {
          setCharities((data ?? []) as Charity[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <div className='mx-auto max-w-7xl px-4 py-24 text-white'>
      <div className='text-center'>
        <p className='text-sm uppercase tracking-wider text-gray-500'>OUR PARTNERS</p>
        <h1 className='mt-4 text-4xl sm:text-5xl font-bold text-white'>Charities we support.</h1>
        <p className='mt-4 mx-auto max-w-2xl text-gray-400'>
          We partner with world-class organizations making a real impact. Choose the cause that resonates with you, and 10% of your subscription goes
          directly to them.
        </p>
      </div>

      <div className='mt-12 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4'>
        <div className='relative w-full sm:w-auto sm:flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search charities'
            className='bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 w-full sm:max-w-md text-white placeholder-gray-500 focus:ring-2 focus:ring-gray-600'
          />
        </div>

        <button className='flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:bg-gray-800 transition'>
          <Filter className='h-4 w-4' />
          Filter
        </button>
      </div>

      {loading ? (
        <div className='text-gray-400'>Loading charities...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredCharities.map(charity => (
            <div key={charity.id} className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition'>
              <img
                src={charity.image_url || 'https://images.unsplash.com/photo-1535139262971-c51845709a48?q=80&w=800&auto=format&fit=crop'}
                alt={charity.name}
                className='h-48 w-full object-cover'
              />
              <div className='p-5'>
                <h2 className='text-xl font-bold text-white'>{charity.name}</h2>
                <p className='mt-2 text-gray-400 line-clamp-3'>{charity.description || 'No description available.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
