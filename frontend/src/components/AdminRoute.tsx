import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkRole() {
      if (!user) {
        if (!active) return;
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

      if (!active) return;
      setIsAdmin(data?.role === 'admin');
      setCheckingRole(false);
    }

    checkRole();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || checkingRole) return null;
  if (!user) return <Navigate to='/login' replace />;
  if (!isAdmin) return <Navigate to='/dashboard' replace />;
  return <>{children}</>;
}
