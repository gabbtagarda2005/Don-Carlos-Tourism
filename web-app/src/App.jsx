import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SiteLayout from './components/SiteLayout';
import { PageLoader } from './components/ui';
import Home from './pages/public/Home';

const Explore = lazy(() => import('./pages/public/Explore'));
const SpotDetail = lazy(() => import('./pages/public/SpotDetail'));
const Events = lazy(() => import('./pages/public/Events'));
const Stays = lazy(() => import('./pages/public/Stays'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const Account = lazy(() => import('./pages/public/Account'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const AdminSpots = lazy(() => import('./pages/admin/Spots'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminBusinesses = lazy(() => import('./pages/admin/Businesses'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));
const AdminSystem = lazy(() => import('./pages/admin/System'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children, staff = false }) {
  const { user, ready, isStaff } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (staff && !isStaff) return <Navigate to="/account" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="spots/:slug" element={<SpotDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="stays" element={<Stays />} />
            <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="admin"
            element={
              <RequireAuth staff>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Overview />} />
            <Route path="spots" element={<AdminSpots />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="system" element={<AdminSystem />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
