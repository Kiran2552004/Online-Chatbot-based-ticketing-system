import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { staggerContainer, slideUp, fadeIn, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

/* ── tiny badge helper ── */
const PayBadge = ({ status }) => {
  const cfg = {
    paid: { cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    pending: { cls: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    failed: { cls: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  }[status] || { cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const TicketBadge = ({ value, type }) => {
  const status = {
    Resolved: 'bg-emerald-100 text-emerald-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Open: 'bg-amber-100 text-amber-800',
  };
  const priority = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-orange-100 text-orange-800',
    Low: 'bg-gray-100 text-gray-700',
  };
  const cls = type === 'status' ? status[value] : priority[value];
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{value}</span>;
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
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
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <AnimatedBackground variant="neutral" className="flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-purple-500" />
      </AnimatedBackground>
    );
  }

  /* shared card style */
  const cardStyle = {
    background: 'rgba(14,10,32,0.82)',
    border: '1px solid rgba(139,92,246,0.2)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  };

  return (
    <AnimatedBackground variant="neutral">
      {/* ── Sticky Header ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(8,11,18,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">🏠 Dashboard</h1>
              <p className="text-purple-400 text-sm mt-0.5">Welcome back, <span className="text-purple-200 font-semibold">{user?.name}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }} whileTap={tap}
                className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)' }}>
                💬 Chat
              </motion.button>
              <motion.button onClick={handleLogout}
                whileHover={{ scale: 1.05 }} whileTap={tap}
                className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* ══ Museum Bookings ══ */}
        <motion.div
          variants={slideUp} initial="hidden" animate="show"
          className="rounded-3xl overflow-hidden"
          style={cardStyle}
        >
          {/* section header */}
          <div className="flex flex-wrap justify-between items-center gap-4 p-7 border-b"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'linear-gradient(135deg,rgba(139,92,246,0.08) 0%,rgba(99,102,241,0.04) 100%)' }}>
            <div>
              <h2 className="text-xl font-bold text-white">🎫 My Museum Bookings</h2>
              <p className="text-purple-400 text-sm mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-3">
              <motion.button onClick={() => navigate('/booking-history')} whileHover={{ scale: 1.04 }} whileTap={tap}
                className="px-5 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)' }}>
                View All
              </motion.button>
              <motion.button onClick={() => navigate('/chat')} whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }} whileTap={tap}
                className="px-5 py-2 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                <span className="relative z-10">Book Tickets</span>
              </motion.button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-14 text-purple-400">
              <div className="text-5xl mb-4">🎫</div>
              <p className="text-lg mb-4">No bookings yet</p>
              <motion.button onClick={() => navigate('/chat')} whileHover={{ scale: 1.05 }} whileTap={tap}
                className="text-purple-300 hover:text-white underline underline-offset-2 font-semibold transition-colors">
                Book your first ticket →
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(139,92,246,0.06)', borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
                    {['Museum', 'Date', 'Tickets', 'Amount', 'Status', 'Booking ID'].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-purple-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                  {bookings.slice(0, 5).map((b, i) => (
                    <motion.tr key={b._id} variants={slideUp}
                      whileHover={{ backgroundColor: 'rgba(139,92,246,0.06)' }}
                      className="border-b transition-colors cursor-default"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-6 py-4 text-sm font-medium text-white">{b.museum?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-purple-300">
                        {new Date(b.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{b.ticketCount}</td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-300">₹{b.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4"><PayBadge status={b.paymentStatus} /></td>
                      <td className="px-6 py-4 text-xs font-mono text-purple-400">{b.bookingId}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ══ Support Tickets ══ */}
        <motion.div
          variants={slideUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
          className="rounded-3xl overflow-hidden"
          style={cardStyle}
        >
          <div className="flex flex-wrap justify-between items-center gap-4 p-7 border-b"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'linear-gradient(135deg,rgba(236,72,153,0.07) 0%,rgba(139,92,246,0.05) 100%)' }}>
            <div>
              <h2 className="text-xl font-bold text-white">🎟 My Support Tickets</h2>
              <p className="text-purple-400 text-sm mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-3">
              <motion.button onClick={() => navigate('/my-tickets')} whileHover={{ scale: 1.04 }} whileTap={tap}
                className="px-5 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)' }}>
                View All
              </motion.button>
              <motion.button onClick={() => navigate('/support-ticket')} whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(236,72,153,0.4)' }} whileTap={tap}
                className="px-5 py-2 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#db2777,#a855f7)' }}>
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                <span className="relative z-10">+ Create Ticket</span>
              </motion.button>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-14 text-purple-400">
              <div className="text-5xl mb-4">🎫</div>
              <p className="text-lg mb-4">No support tickets yet</p>
              <motion.button onClick={() => navigate('/support-ticket')} whileHover={{ scale: 1.05 }} whileTap={tap}
                className="text-purple-300 hover:text-white underline underline-offset-2 font-semibold transition-colors">
                Create a support ticket →
              </motion.button>
            </div>
          ) : (
            <motion.div className="p-6 space-y-3" variants={staggerContainer} initial="hidden" animate="show">
              {tickets.map((t) => (
                <motion.div key={t._id} variants={slideUp}
                  whileHover={{ x: 4, boxShadow: '0 8px 30px rgba(139,92,246,0.2)' }}
                  onClick={() => navigate(`/my-tickets/${t._id}`)}
                  className="rounded-2xl p-5 cursor-pointer transition-all"
                  style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-purple-400">{t.ticketId}</span>
                        <TicketBadge value={t.status} type="status" />
                        <TicketBadge value={t.priority} type="priority" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{t.issueType}</h3>
                      <p className="text-sm text-purple-300 line-clamp-2">{t.description}</p>
                    </div>
                    <span className="text-purple-500 text-xs flex-shrink-0 mt-1">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </div>
    </AnimatedBackground>
  );
};

export default Dashboard;
