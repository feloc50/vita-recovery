import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LogOut, Settings, Menu, LayoutGrid, Users, Calendar, CalendarClock, BarChart3, Clock, MapPin, Ticket } from 'lucide-react';
import { getUserProfile } from '../services/profile';
import { useUserRole } from '../hooks/useUserRole';

interface DropdownProps {
  onClose: () => void;
  onLogout: () => void;
}

function AccountDropdown({ onClose, onLogout }: DropdownProps) {
  const navigate = useNavigate();
  const { isAdmin, isProfessional } = useUserRole();

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  const professionalLinks = [
    { path: '/admin', icon: LayoutGrid, name: 'Dashboard' },
    { path: '/admin/availability', icon: Clock, name: 'Availability' }
  ];

  const adminLinks = [
    { path: '/admin', icon: LayoutGrid, name: 'Dashboard' },
    { path: '/admin/professionals', icon: Users, name: 'Professionals' },
    { path: '/admin/clients', icon: Users, name: 'Clients' },
    { path: '/admin/services', icon: Calendar, name: 'Services' },
    { path: '/admin/locations', icon: MapPin, name: 'Locations' },
    { path: '/admin/appointments', icon: CalendarClock, name: 'Appointments' },
    { path: '/admin/analytics', icon: BarChart3, name: 'Analytics' },
    { path: '/admin/availability', icon: Clock, name: 'Availability' },
    { path: '/admin/coupon-books', icon: Ticket, name: 'Coupon Books' }
  ];

  const links = isAdmin ? adminLinks : professionalLinks;

  return (
    <div className="py-1">
      {(isAdmin || isProfessional) && (
        <>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Professional Area
          </div>
          {links.map(({ path, icon: Icon, name }) => (
            <button
              key={path}
              onClick={() => {
                onClose();
                navigate(path);
              }}
              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 active:bg-primary-100 transition-colors duration-200"
            >
              <Icon className="mr-3 h-4 w-4 text-gray-400" />
              <span>{name}</span>
            </button>
          ))}
          <div className="my-2 border-t border-gray-200" />
        </>
      )}
      <button
        onClick={handleSettingsClick}
        className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 active:bg-primary-100 transition-colors duration-200"
      >
        <Settings className="mr-3 h-4 w-4 text-gray-400" />
        <span>Settings</span>
      </button>
      <button
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 active:bg-primary-100 transition-colors duration-200"
      >
        <LogOut className="mr-3 h-4 w-4 text-gray-400" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

export function Layout() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAuthPage = ['/signin', '/signup', '/forgot-password'].includes(location.pathname);
  const { isAdmin, isProfessional } = useUserRole();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    async function fetchUserProfile() {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setFirstName(profile.firstName);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }

    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img src="/vita-logo.svg" alt="Vita Recovery" className="h-8 w-auto" />
              </Link>
            </div>

            {currentUser && (
              <div className="flex items-center">
                {/* Desktop view */}
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-gray-700">Hello, {firstName || 'User'}</span>
                  {(isAdmin || isProfessional) && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>

                {/* Mobile view */}
                <div className="md:hidden relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    aria-label="Menu"
                    aria-expanded={isMobileMenuOpen}
                    aria-haspopup="true"
                  >
                    <Menu className="h-6 w-6" />
                  </button>

                  {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
                        <p className="text-sm font-medium text-gray-700">Hello, {firstName || 'User'}</p>
                      </div>
                      <AccountDropdown 
                        onClose={() => setIsMobileMenuOpen(false)}
                        onLogout={handleLogout}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!currentUser && !isAuthPage && (
              <Link
                to="/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isAdminPage ? (
        <Outlet />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}