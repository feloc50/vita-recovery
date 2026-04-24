import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, UserCircle, Calendar, BarChart3, CalendarClock, Clock, MapPin, Ticket } from 'lucide-react';
import { useUserRole } from '../hooks/useUserRole';

const adminNavItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutGrid,
    adminOnly: false
  },
  {
    name: 'Professionals',
    path: '/admin/professionals',
    icon: Users,
    adminOnly: true
  },
  {
    name: 'Clients',
    path: '/admin/clients',
    icon: UserCircle,
    adminOnly: true
  },
  {
    name: 'Services',
    path: '/admin/services',
    icon: Calendar,
    adminOnly: true
  },
  {
    name: 'Locations',
    path: '/admin/locations',
    icon: MapPin,
    adminOnly: true
  },
  {
    name: 'Appointments',
    path: '/admin/appointments',
    icon: CalendarClock,
    adminOnly: true
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
    adminOnly: true
  },
  {
    name: 'Availability',
    path: '/admin/availability',
    icon: Clock,
    adminOnly: false
  },
  {
    name: 'Coupon Books',
    path: '/admin/coupon-books',
    icon: Ticket,
    adminOnly: true
  }
];

export function AdminNav() {
  const location = useLocation();
  const { isAdmin } = useUserRole();

  // Filter nav items based on admin status
  const visibleNavItems = adminNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="space-y-1">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md
              transition-colors duration-150 ease-in-out
              ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
              }
            `}
          >
            <Icon
              className={`
                mr-3 h-5 w-5 transition-colors duration-150 ease-in-out
                ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'}
              `}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}