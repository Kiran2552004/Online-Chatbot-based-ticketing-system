import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, hoverLift, tap } from '../components/animations/motions';
import SkeletonLoader from '../components/SkeletonLoader';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bookingsRes, ticketsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/support-tickets'),
      ]);

      setBookings(bookingsRes.data.data);
      setTickets(ticketsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-purple-100">Welcome, {user?.name}</span>
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                💬 Chat
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-lg"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Museum Bookings Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20"
          variants={slideUp}
          whileHover={hoverLift}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Museum Bookings</h2>
            <div className="flex gap-3">
              <motion.button
                onClick={() => navigate('/booking-history')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg"
              >
                View All Bookings
              </motion.button>
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                Book Tickets
              </motion.button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <motion.div
              className="text-center py-12 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-lg">No bookings yet</p>
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Book your first ticket →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="overflow-x-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Museum</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tickets</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Booking ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking, index) => (
                    <motion.tr
                      key={booking._id}
                      variants={slideUp}
                      whileHover={{
                        backgroundColor: 'rgba(147, 51, 234, 0.05)',
                        x: 5,
                      }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-purple-50/50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.museum?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.ticketCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {booking.bookingId}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>

        {/* Support Tickets Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
          variants={slideUp}
          whileHover={hoverLift}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Support Tickets</h2>
          </div>

          {tickets.length === 0 ? (
            <motion.div
              className="text-center py-12 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-lg">No support tickets yet</p>
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={tap}
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Create a support ticket →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  variants={slideUp}
                  whileHover={{
                    scale: 1.02,
                    x: 5,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all bg-white/50 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-600">
                          {ticket.ticketId}
                        </span>
                        <motion.span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            ticket.status === 'Resolved'
                              ? 'bg-green-100 text-green-800'
                              : ticket.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {ticket.status}
                        </motion.span>
                        <motion.span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            ticket.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : ticket.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {ticket.priority}
                        </motion.span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{ticket.issueType}</h3>
                      <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
