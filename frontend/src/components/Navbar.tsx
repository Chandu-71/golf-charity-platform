import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        if (active) setRole(null);
        return;
      }
      try {
        const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();

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

  const scrollToCharities = () => {
    const section = document.getElementById('charities');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCharitiesClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (location.pathname === '/') {
      scrollToCharities();
    } else {
      navigate('/');
      setTimeout(scrollToCharities, 150);
    }
  };

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className='border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 sticky top-0 z-50'>
      <div className='mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4'>
        <Link to='/' className='flex items-center gap-2 font-semibold tracking-tight'>
          <span className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10'>
            <HeartHandshake className='h-5 w-5' />
          </span>
          <span>Impact Club</span>
        </Link>

        <nav className='hidden sm:flex items-center gap-6 text-sm text-zinc-200'>
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
        </nav>

        <div className='flex items-center gap-2'>
          {user ? (
            <>
              <span className='hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200'>{user.email}</span>
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
                className='hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-colors'
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
        </div>
      </div>
    </div>
  );
}
