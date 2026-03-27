export function Footer() {
  return (
    <footer className='bg-gray-950 border-t border-gray-800 text-gray-300'>
      <div className='mx-auto max-w-7xl px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-xl font-bold text-white'>Golf Charity Platform</h3>
            <p className='mt-3 text-sm text-gray-400'>Modern performance tracking and monthly prize draws supporting global charities.</p>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide'>Platform</h4>
            <ul className='mt-4 space-y-2 text-sm'>
              <li>
                <a href='/dashboard' className='hover:text-white transition-colors'>
                  Dashboard
                </a>
              </li>
              <li>
                <a href='/' className='hover:text-white transition-colors'>
                  Charities
                </a>
              </li>
              <li>
                <a href='/' className='hover:text-white transition-colors'>
                  Monthly Draws
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide'>Legal</h4>
            <ul className='mt-4 space-y-2 text-sm'>
              <li>
                <a href='/terms' className='hover:text-white transition-colors'>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href='/privacy' className='hover:text-white transition-colors'>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
          <p className='text-xs text-gray-500'>© {new Date().getFullYear()} Golf Charity Platform</p>
          <p className='text-xs text-gray-400 uppercase tracking-widest'>TRACK • IMPACT • WIN</p>
        </div>
      </div>
    </footer>
  );
}
