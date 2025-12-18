import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, hoverLift, tap } from '../components/animations/motions';
import SkeletonLoader from '../components/SkeletonLoader';

const BookingHistory = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      // If user is admin, fetch all bookings, otherwise fetch user's bookings
      const endpoint = isAdmin() ? '/admin/bookings' : '/bookings';
      const response = await api.get(endpoint);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (bookingId) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/tickets/${bookingId}`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `ticket-${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error downloading PDF:', error);
        alert('Error downloading ticket. Please try again.');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {isAdmin() ? 'All Bookings' : 'Booking History'}
            </h1>
            <motion.button
              onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={tap}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              ← Back to {isAdmin() ? 'Admin Dashboard' : 'Dashboard'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {bookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/20"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🎫
              </motion.div>
              <p className="text-xl text-gray-600 mb-4">No bookings yet</p>
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
              >
                Book Your First Ticket
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="bookings"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  variants={slideUp}
                  whileHover={hoverLift}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden relative group"
                >
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300"
                  />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {booking.museum?.name || 'Museum'}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">{booking.bookingId}</p>
                      </div>
                      <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : booking.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {booking.paymentStatus}
                      </motion.span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-800">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tickets:</span>
                        <span className="font-semibold text-gray-800">{booking.ticketCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          ₹{booking.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {booking.paymentStatus === 'paid' && booking.pdfUrl && (
                      <motion.button
                        onClick={() => handleDownloadPDF(booking.bookingId)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={tap}
                        className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <span>📥</span>
                        Download Ticket PDF
                      </motion.button>
                    )}

                    {booking.paymentStatus === 'paid' && !booking.pdfUrl && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        PDF generating...
                      </p>
                    )}
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookingHistory;
