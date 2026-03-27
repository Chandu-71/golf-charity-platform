import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AdminRoute } from './components/AdminRoute';
import { Admin } from './pages/Admin';
import { Checkout } from './pages/Checkout';
import { Charities } from './pages/Charities';
import { Results } from './pages/Results';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col bg-zinc-950 text-zinc-100'>
      <Navbar />
      <main className='flex-grow'>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/checkout'
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin'
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route path='/charities' element={<Charities />} />
            <Route path='/results' element={<Results />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
