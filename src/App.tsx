import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProfessionalsManagement } from './pages/admin/ProfessionalsManagement';
import { ClientsManagement } from './pages/admin/ClientsManagement';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { LocationsManagement } from './pages/admin/LocationsManagement';
import { AppointmentsManagement } from './pages/admin/AppointmentsManagement';
import { AnalyticsManagement } from './pages/admin/AnalyticsManagement';
import { ProfessionalAvailability } from './pages/admin/ProfessionalAvailability';
import { CouponBooksManagement } from './pages/admin/CouponBooksManagement';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { BookingFlow } from './pages/BookingFlow';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/book" element={<BookingFlow />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route element={<Layout />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/professionals" element={<ProfessionalsManagement />} />
                <Route path="/admin/clients" element={<ClientsManagement />} />
                <Route path="/admin/services" element={<ServicesManagement />} />
                <Route path="/admin/locations" element={<LocationsManagement />} />
                <Route path="/admin/appointments" element={<AppointmentsManagement />} />
                <Route path="/admin/analytics" element={<AnalyticsManagement />} />
                <Route path="/admin/availability" element={<ProfessionalAvailability />} />
                <Route path="/admin/coupon-books" element={<CouponBooksManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}