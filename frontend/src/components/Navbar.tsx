import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HeartHandshake, Menu, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        if (active) setRole(null);
        return;
      }
      try {
        const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

        if (!active) return;
        if (error) {
          console.error('Failed to load profile role', error);
          setRole(null);
          return;
        }

        setRole(profile?.role ?? null);
      } catch (err) {
        console.error(err);
        if (active) setRole(null);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className='sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800'>
      <div className='mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4'>
        <Link to='/' className='flex items-center gap-2 font-semibold tracking-tight'>
          <span className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10'>
            <HeartHandshake className='h-5 w-5' />
          </span>
          <span>Impact Club</span>
        </Link>

        <div className='hidden md:flex items-center gap-6 text-sm text-zinc-200'>
          <Link to='/charities' className='hover:text-white transition-colors'>
            Charities
          </Link>
          <Link to='/results' className='hover:text-white transition-colors'>
            Results
          </Link>
          {user ? (
            <Link to='/dashboard' className='hover:text-white transition-colors'>
              Dashboard
            </Link>
          ) : null}
          {user && role === 'admin' ? (
            <Link to='/admin' className='font-semibold text-amber-300 hover:text-amber-200 transition-colors'>
              Admin
            </Link>
          ) : null}
        </div>

        <div className='flex items-center gap-2'>
          {user ? (
            <>
              <Link
                to='/profile'
                className='w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-600 transition'
              >
                <User size={20} />
              </Link>
              <button
                type='button'
                onClick={handleLogout}
                className='inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-colors'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='hidden md:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-colors'
              >
                Login
              </Link>
              <Link
                to='/signup'
                className='inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors'
              >
                Subscribe
              </Link>
            </>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='text-gray-300 hover:text-white md:hidden p-2'
            type='button'
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className='md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl absolute top-full left-0 w-full px-4 py-6 flex flex-col gap-4 shadow-2xl'>
          <Link
            to='/charities'
            onClick={() => setIsMobileMenuOpen(false)}
            className='block text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-gray-800/50'
          >
            Charities
          </Link>
          <Link
            to='/results'
            onClick={() => setIsMobileMenuOpen(false)}
            className='block text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-gray-800/50'
          >
            Results
          </Link>
          {user ? (
            <Link
              to='/dashboard'
              onClick={() => setIsMobileMenuOpen(false)}
              className='block text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-gray-800/50'
            >
              Dashboard
            </Link>
          ) : null}
          {user && role === 'admin' ? (
            <Link
              to='/admin'
              onClick={() => setIsMobileMenuOpen(false)}
              className='block text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-gray-800/50'
            >
              Admin
            </Link>
          ) : null}
        </div>
      )}
    </nav>
  );
}
