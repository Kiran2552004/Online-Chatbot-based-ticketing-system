import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const STATUS_CONFIG = {
  paid: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Paid' },
  pending: { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', label: 'Pending' },
  failed: { bg: 'bg-red-100 text-red-800', dot: 'bg-red-500', label: 'Failed' },
};

const BookingHistory = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const endpoint = isAdmin() ? '/admin/bookings' : '/bookings';
      const res = await api.get(endpoint);
      setBookings(res.data.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (bookingId) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/tickets/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ticket-${bookingId}.pdf`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Error downloading ticket. Please try again.'));
  };

  if (loading) {
    return (
      <AnimatedBackground variant="neutral" className="flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-purple-500" />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="neutral">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(8,11,18,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{isAdmin() ? '📋 All Bookings' : '🎫 Booking History'}</h1>
              {!loading && <p className="text-purple-400 text-sm mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>}
            </div>
            <motion.button
              onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
              whileHover={{ scale: 1.05 }} whileTap={tap}
              className="px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              ← {isAdmin() ? 'Admin Dashboard' : 'Dashboard'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {bookings.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <motion.div className="text-7xl mb-5" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>🎫</motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">No Bookings Yet</h2>
              <p className="text-purple-400 mb-6">Book your first museum ticket through our AI chat assistant!</p>
              <motion.button onClick={() => navigate('/chat')} whileHover={{ scale: 1.05 }} whileTap={tap}
                className="px-8 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7,#db2777)', boxShadow: '0 0 30px rgba(139,92,246,0.35)' }}>
                Book Your First Ticket
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="bookings" variants={staggerContainer} initial="hidden" animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking, index) => {
                const sc = STATUS_CONFIG[booking.paymentStatus] || STATUS_CONFIG.pending;
                return (
                  <motion.div key={booking._id} variants={slideUp}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="relative rounded-3xl overflow-hidden group cursor-default"
                    style={{
                      background: 'rgba(14,10,32,0.80)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                    {/* Card top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(to right,#7c3aed,#a855f7,#db2777)' }} />
                    <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{ background: 'linear-gradient(225deg,rgba(139,92,246,0.15) 0%,transparent 60%)' }} />

                    <div className="relative z-10 p-6">
                      {/* Museum name + status */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-3">
                          <h3 className="text-lg font-bold text-white leading-tight mb-1">{booking.museum?.name || 'Museum'}</h3>
                          <p className="text-xs font-mono text-purple-400">{booking.bookingId}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${sc.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-5">
                        {[
                          ['📅 Date', new Date(booking.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })],
                          ['🎫 Tickets', booking.ticketCount],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="text-purple-400">{label}</span>
                            <span className="text-white font-medium">{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-white/8">
                          <span className="text-purple-400 text-sm">💰 Amount</span>
                          <span className="text-xl font-bold text-purple-300">₹{booking.amount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {booking.paymentStatus === 'paid' && booking.pdfUrl && (
                        <motion.button onClick={() => handleDownloadPDF(booking.bookingId)}
                          whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(52,211,153,0.4)' }} whileTap={tap}
                          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg,#059669,#34d399)' }}>
                          <motion.div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
                            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                          <span className="relative z-10">📥 Download PDF Ticket</span>
                        </motion.button>
                      )}
                      {booking.paymentStatus === 'paid' && !booking.pdfUrl && (
                        <p className="text-xs text-center text-purple-500 py-1">PDF generating…</p>
                      )}
                    </div>

                    {/* Shine on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl" />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedBackground>
  );
};

export default BookingHistory;
