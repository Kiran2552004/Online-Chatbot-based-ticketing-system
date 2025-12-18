import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, hoverLift, tap } from '../components/animations/motions';

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [showMuseumForm, setShowMuseumForm] = useState(false);
  const [editingMuseum, setEditingMuseum] = useState(null);
  const [museumForm, setMuseumForm] = useState({
    name: '',
    description: '',
    location: 'Bengaluru',
    price: '',
    imageUrl: '',
    isActive: true,
  });
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilters, setBookingFilters] = useState({
    status: '',
    date: '',
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings' && user) {
      fetchData();
    }
  }, [bookingFilters.status, bookingFilters.date]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (bookingFilters.status) params.append('status', bookingFilters.status);
      if (bookingFilters.date) params.append('date', bookingFilters.date);
      if (bookingSearch) params.append('search', bookingSearch);

      const [bookingsRes, ticketsRes, museumsRes, usersRes] = await Promise.all([
        api.get(`/admin/bookings?${params.toString()}`),
        api.get('/admin/tickets'),
        api.get('/admin/museums'),
        api.get('/admin/users'),
      ]);

      setBookings(bookingsRes.data.data);
      setTickets(ticketsRes.data.data);
      setMuseums(museumsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketStatusUpdate = async (ticketId, newStatus) => {
    try {
      await api.put(`/admin/tickets/${ticketId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket status');
    }
  };

  const handleBookingSearch = () => {
    fetchData();
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

  const handleMuseumSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMuseum) {
        await api.put(`/admin/museums/${editingMuseum._id}`, museumForm);
      } else {
        await api.post('/admin/museums', museumForm);
      }
      setShowMuseumForm(false);
      setEditingMuseum(null);
      setMuseumForm({
        name: '',
        description: '',
        location: 'Bengaluru',
        price: '',
        imageUrl: '',
        isActive: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving museum:', error);
      alert('Failed to save museum');
    }
  };

  const handleEditMuseum = (museum) => {
    setEditingMuseum(museum);
    setMuseumForm({
      name: museum.name,
      description: museum.description,
      location: museum.location,
      price: museum.price,
      imageUrl: museum.imageUrl,
      isActive: museum.isActive,
    });
    setShowMuseumForm(true);
  };

  const handleDeleteMuseum = async (museumId) => {
    if (!window.confirm('Are you sure you want to delete this museum?')) return;
    try {
      await api.delete(`/admin/museums/${museumId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting museum:', error);
      alert('Failed to delete museum');
    }
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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-purple-100">Admin: {user?.name}</span>
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
        {/* Tabs */}
        <motion.div
          className="flex space-x-4 mb-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-xl p-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {['bookings', 'tickets', 'museums', 'users'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={tap}
              className={`px-6 py-3 font-semibold capitalize transition-all rounded-lg ${
                activeTab === tab
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Bookings</h2>
              </div>

              {/* Search and Filters */}
              <motion.div
                className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Search by Booking ID, User, Museum..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBookingSearch()}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                <select
                  value={bookingFilters.status}
                  onChange={(e) => {
                    setBookingFilters({ ...bookingFilters, status: e.target.value });
                    setTimeout(() => fetchData(), 100);
                  }}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <input
                  type="date"
                  value={bookingFilters.date}
                  onChange={(e) => {
                    setBookingFilters({ ...bookingFilters, date: e.target.value });
                    setTimeout(() => fetchData(), 100);
                  }}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                <motion.button
                  onClick={handleBookingSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={tap}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg"
                >
                  Search
                </motion.button>
              </motion.div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Museum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tickets</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
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
                        <td className="px-6 py-4 text-sm">{booking.museum?.name || 'N/A'}</td>
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
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-6">Support Tickets</h2>
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
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-mono text-sm font-semibold">{ticket.ticketId}</span>
                        <motion.span
                          className="ml-3 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          {ticket.priority}
                        </motion.span>
                      </div>
                      <motion.select
                        value={ticket.status}
                        onChange={(e) => handleTicketStatusUpdate(ticket._id, e.target.value)}
                        whileFocus={{ scale: 1.05 }}
                        className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </motion.select>
                    </div>
                    <h3 className="font-semibold mb-1">{ticket.issueType}</h3>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <p className="text-xs text-gray-500">
                      {ticket.name} ({ticket.email}) - {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Museums Tab */}
          {activeTab === 'museums' && (
            <motion.div
              key="museums"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Museums</h2>
                <motion.button
                  onClick={() => {
                    setEditingMuseum(null);
                    setMuseumForm({
                      name: '',
                      description: '',
                      location: 'Bengaluru',
                      price: '',
                      imageUrl: '',
                      isActive: true,
                    });
                    setShowMuseumForm(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={tap}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg"
                >
                  + Add Museum
                </motion.button>
              </div>

              <AnimatePresence>
                {showMuseumForm && (
                  <motion.form
                    onSubmit={handleMuseumSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl space-y-4 border border-purple-100"
                  >
                    <input
                      type="text"
                      placeholder="Museum Name"
                      value={museumForm.name}
                      onChange={(e) => setMuseumForm({ ...museumForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <textarea
                      placeholder="Description"
                      value={museumForm.description}
                      onChange={(e) => setMuseumForm({ ...museumForm, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={museumForm.location}
                      onChange={(e) => setMuseumForm({ ...museumForm, location: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price (INR)"
                      value={museumForm.price}
                      onChange={(e) => setMuseumForm({ ...museumForm, price: e.target.value })}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={museumForm.imageUrl}
                      onChange={(e) => setMuseumForm({ ...museumForm, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={museumForm.isActive}
                        onChange={(e) => setMuseumForm({ ...museumForm, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <div className="flex space-x-2">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={tap}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
                      >
                        {editingMuseum ? 'Update' : 'Create'}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setShowMuseumForm(false);
                          setEditingMuseum(null);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={tap}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {museums.map((museum) => (
                  <motion.div
                    key={museum._id}
                    variants={slideUp}
                    whileHover={hoverLift}
                    className="border border-gray-200 rounded-xl p-5 bg-white/50 backdrop-blur-sm hover:border-purple-300 transition-all"
                  >
                    <h3 className="font-bold text-lg mb-2">{museum.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{museum.description}</p>
                    <p className="text-sm font-semibold mb-3">₹{museum.price} per ticket</p>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => handleEditMuseum(museum)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={tap}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteMuseum(museum._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={tap}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-md"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-6">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u, index) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: 'rgba(147, 51, 234, 0.05)',
                          x: 5,
                        }}
                        className="hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-sm">{u.email}</td>
                        <td className="px-6 py-4 text-sm">{u.phone || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <motion.span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {u.role}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
