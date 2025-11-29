import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/records', icon: FileText, label: 'Records' },
    { path: '/abha', icon: User, label: 'ABHA' },
    { path: '/communities', icon: Users, label: 'Communities' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900 flex items-center justify-center p-6">
      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl top-0 left-0"></div>
        <div className="absolute w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl bottom-0 right-0"></div>
      </div>

      {/* Mobile Phone Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '95vh', maxHeight: '850px', minHeight: '700px' }}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-50">
            <div className="px-4">
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Vaidya Health" className="h-8 w-auto" />
                  <div>
                    <h1 className="text-base font-bold text-gray-900">Vaidya Health</h1>
                    <p className="text-xs text-gray-500">Your Health, Your Control</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 overflow-y-auto">
            <Outlet />
          </main>

          {/* Bottom Navigation */}
          <nav className="bg-white border-t border-gray-200 flex-shrink-0 z-50 shadow-lg">
            <div className="flex justify-around items-center py-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors min-w-[60px] ${
                    isActive(path)
                      ? 'text-cyan-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon size={22} className={isActive(path) ? 'stroke-[2.5]' : 'stroke-2'} />
                  <span className={`text-[10px] font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}