import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, hoverLift, tap } from '../components/animations/motions';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMuseum, setSelectedMuseum] = useState('all');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    groupBookingsByMuseum();
  }, [bookings, selectedMuseum]);

  const fetchData = async () => {
    try {
      const [bookingsRes, museumsRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/museums'),
      ]);

      setBookings(bookingsRes.data.data);
      setMuseums(museumsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupBookingsByMuseum = () => {
    const grouped = {};
    
    bookings.forEach((booking) => {
      const museumId = booking.museum?._id?.toString() || 'unknown';
      const museumName = booking.museum?.name || 'Unknown Museum';

      if (selectedMuseum !== 'all' && museumId !== selectedMuseum) {
        return;
      }

      if (!grouped[museumId]) {
        grouped[museumId] = {
          museumName,
          bookings: [],
          totalTickets: 0,
          totalRevenue: 0,
        };
      }

      grouped[museumId].bookings.push(booking);
      grouped[museumId].totalTickets += booking.ticketCount;
      grouped[museumId].totalRevenue += booking.amount;
    });

    setGroupedBookings(grouped);
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Panel - Bookings by Museum</h1>
            <div className="flex items-center space-x-4">
              <span className="text-purple-100">Admin: {user?.name}</span>
              <motion.button
                onClick={() => navigate('/admin')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                Full Dashboard
              </motion.button>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Museum Filter */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-gray-700 font-medium mb-2">Filter by Museum:</label>
          <motion.select
            value={selectedMuseum}
            onChange={(e) => setSelectedMuseum(e.target.value)}
            whileFocus={{ scale: 1.02 }}
            className="w-full md:w-64 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          >
            <option value="all">All Museums</option>
            {museums.map((museum) => (
              <option key={museum._id} value={museum._id}>
                {museum.name}
              </option>
            ))}
          </motion.select>
        </motion.div>

        {/* Grouped Bookings */}
        <AnimatePresence mode="wait">
          {Object.keys(groupedBookings).length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/20"
            >
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-600">No bookings found</p>
            </motion.div>
          ) : (
            <motion.div
              key="bookings"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {Object.entries(groupedBookings).map(([museumId, museumData], index) => (
                <motion.div
                  key={museumId}
                  variants={slideUp}
                  whileHover={hoverLift}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20"
                >
                  {/* Museum Header */}
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 relative overflow-hidden"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-2">{museumData.museumName}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                        >
                          <p className="text-purple-100 text-sm">Total Bookings</p>
                          <p className="text-2xl font-bold">{museumData.bookings.length}</p>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                        >
                          <p className="text-purple-100 text-sm">Total Tickets</p>
                          <p className="text-2xl font-bold">{museumData.totalTickets}</p>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                        >
                          <p className="text-purple-100 text-sm">Total Revenue</p>
                          <p className="text-2xl font-bold">₹{museumData.totalRevenue.toLocaleString('en-IN')}</p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bookings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Booking ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tickets</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {museumData.bookings.map((booking, bookingIndex) => (
                          <motion.tr
                            key={booking._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: bookingIndex * 0.05 }}
                            whileHover={{
                              backgroundColor: 'rgba(147, 51, 234, 0.05)',
                              x: 5,
                            }}
                            className="hover:bg-purple-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono">{booking.bookingId}</td>
                            <td className="px-6 py-4 text-sm">
                              <div>{booking.user?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{booking.user?.email || ''}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(booking.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 text-sm">{booking.ticketCount}</td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              ₹{booking.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4">
                              <motion.span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
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
                            </td>
                            <td className="px-6 py-4">
                              {booking.pdfUrl && booking.paymentStatus === 'paid' ? (
                                <motion.button
                                  onClick={() => handleDownloadPDF(booking.bookingId)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={tap}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                >
                                  📥 PDF
                                </motion.button>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
