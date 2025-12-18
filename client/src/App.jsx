import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/animations/PageTransition';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatbotWindow from './components/ChatbotWindow';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import BookingSuccess from './pages/BookingSuccess';
import BookingCancelled from './pages/BookingCancelled';
import BookingHistory from './pages/BookingHistory';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/chat"
          element={
            <PageTransition>
              <ChatbotWindow />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-history"
          element={
            <ProtectedRoute>
              <PageTransition>
                <BookingHistory />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PageTransition>
              <AdminLogin />
            </PageTransition>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-success"
          element={
            <ProtectedRoute>
              <PageTransition>
                <BookingSuccess />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-cancelled"
          element={
            <PageTransition>
              <BookingCancelled />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

