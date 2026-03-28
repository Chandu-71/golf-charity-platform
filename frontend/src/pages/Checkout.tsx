import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, HeartHandshake } from 'lucide-react';
import { supabase } from '../lib/supabase';

function loadRazorpayScript() {
  return new Promise<boolean>(resolve => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Unable to load Razorpay checkout.');
      setLoading(false);
      return;
    }

    const orderRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!orderRes.ok) {
      setError('Unable to create payment order.');
      setLoading(false);
      return;
    }

    const order = await orderRes.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('No authenticated user found.');
      setLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Golf Charity Platform',
      order_id: order.id,
      handler: async () => {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .upsert({ id: user.id, subscription_status: 'active' }, { onConflict: 'id' })
          .select('subscription_status')
          .maybeSingle();

        if (updateError) {
          setError(updateError.message);
          return;
        }

        if (!updatedProfile) {
          setError('Your subscription could not be updated. Please contact support.');
          return;
        }

        navigate('/dashboard');
      },
      theme: {
        color: '#18181b',
      },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10 sm:py-12'>
      <div className='mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]'>
        <div className='flex items-center gap-3'>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white'>
            <CreditCard className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight text-white'>Checkout</h1>
            <p className='mt-1 text-sm text-zinc-300'>Complete your subscription to unlock score tracking and monthly draws.</p>
          </div>
        </div>

        <div className='mt-6 rounded-2xl border border-white/10 bg-zinc-900/40 p-5'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 text-white'>
              <HeartHandshake className='h-5 w-5' />
              <span className='font-semibold'>Golf Charity Plan - ₹1000/month</span>
            </div>
            <span className='text-sm text-zinc-300'>Recurring</span>
          </div>

          <div className='mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'>
            <ShieldCheck className='h-4 w-4' />
            PCI-compliant payment powered by Razorpay
          </div>

          <button
            type='button'
            onClick={handlePay}
            disabled={loading}
            className='mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60 transition-colors'
          >
            {loading ? 'Preparing checkout...' : 'Pay with Razorpay'}
          </button>

          {error ? <div className='mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100'>{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
