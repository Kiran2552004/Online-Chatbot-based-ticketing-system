import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { slideUp, tap, staggerContainer } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const STATUS_STYLES = {
    Open: 'bg-amber-100 text-amber-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Resolved: 'bg-emerald-100 text-emerald-800',
};

const PRIORITY_STYLES = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-orange-100 text-orange-800',
    Low: 'bg-gray-100 text-gray-700',
};

const STATUS_ICONS = { Open: '🟡', 'In Progress': '🔵', Resolved: '✅' };
const PRIORITY_ICONS = { High: '🔴', Medium: '🟠', Low: '🟢' };

const MyTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchTickets = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/support-tickets?page=${page}&limit=8`);
            setTickets(res.data.data);
            setPagination(res.data.pagination || { page, pages: 1, total: res.data.data.length });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets(1);
    }, []);

    const handlePageChange = (p) => {
        if (p < 1 || p > pagination.pages) return;
        fetchTickets(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatedBackground variant="purple">
            <div className="p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div variants={slideUp} className="mb-8">
                        <motion.button
                            onClick={() => navigate('/dashboard')}
                            whileHover={{ x: -4 }}
                            whileTap={tap}
                            className="mb-4 flex items-center gap-2 text-purple-300 hover:text-white transition-colors font-medium"
                        >
                            ← Back to Dashboard
                        </motion.button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Support Tickets</h1>
                                {!loading && (
                                    <p className="text-purple-300 mt-1">
                                        {pagination.total} ticket{pagination.total !== 1 ? 's' : ''} total
                                    </p>
                                )}
                            </div>
                            <motion.button
                                onClick={() => navigate('/support-ticket')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={tap}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                            >
                                + New Ticket
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                            />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <motion.div
                            variants={slideUp}
                            className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl px-6 py-4 flex items-center gap-3"
                        >
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold">Failed to load tickets</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                            <motion.button
                                onClick={() => fetchTickets(pagination.page)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={tap}
                                className="ml-auto bg-red-500/30 hover:bg-red-500/50 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            >
                                Retry
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && tickets.length === 0 && (
                        <motion.div
                            variants={slideUp}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-16 text-center"
                        >
                            <div className="text-7xl mb-6">🎫</div>
                            <h2 className="text-2xl font-bold text-white mb-3">No Tickets Yet</h2>
                            <p className="text-purple-300 mb-8">
                                Haven't raised a support ticket yet? We're here to help!
                            </p>
                            <motion.button
                                onClick={() => navigate('/support-ticket')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={tap}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                            >
                                Create Your First Ticket
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Tickets Table */}
                    {!loading && !error && tickets.length > 0 && (
                        <motion.div
                            variants={slideUp}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            {['Ticket ID', 'Issue Type', 'Priority', 'Status', 'Created', 'Action'].map(
                                                (h) => (
                                                    <th
                                                        key={h}
                                                        className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider"
                                                    >
                                                        {h}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                                        <AnimatePresence>
                                            {tickets.map((ticket, i) => (
                                                <motion.tr
                                                    key={ticket._id}
                                                    variants={slideUp}
                                                    custom={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                    className="border-b border-white/5 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/my-tickets/${ticket._id}`)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-semibold text-purple-300">
                                                            {ticket.ticketId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                                        {ticket.issueType}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_STYLES[ticket.priority]}`}
                                                        >
                                                            {PRIORITY_ICONS[ticket.priority]} {ticket.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}
                                                        >
                                                            {STATUS_ICONS[ticket.status]} {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-purple-300">
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <motion.button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/my-tickets/${ticket._id}`);
                                                            }}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={tap}
                                                            className="text-purple-400 hover:text-white transition-colors text-sm font-semibold"
                                                        >
                                                            View →
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </motion.tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                    <p className="text-purple-300 text-sm">
                                        Page {pagination.page} of {pagination.pages}
                                    </p>
                                    <div className="flex gap-2">
                                        <motion.button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            whileHover={pagination.page !== 1 ? { scale: 1.05 } : {}}
                                            whileTap={pagination.page !== 1 ? tap : {}}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pagination.page === 1
                                                ? 'bg-white/5 text-purple-500 cursor-not-allowed'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            ← Prev
                                        </motion.button>
                                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                            .filter(
                                                (p) =>
                                                    p === 1 ||
                                                    p === pagination.pages ||
                                                    Math.abs(p - pagination.page) <= 1
                                            )
                                            .map((p, idx, arr) => (
                                                <>
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                        <span key={`ellipsis-${p}`} className="px-2 text-purple-500 self-center">
                                                            …
                                                        </span>
                                                    )}
                                                    <motion.button
                                                        key={p}
                                                        onClick={() => handlePageChange(p)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={tap}
                                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p === pagination.page
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white'
                                                            }`}
                                                    >
                                                        {p}
                                                    </motion.button>
                                                </>
                                            ))}
                                        <motion.button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            whileHover={pagination.page !== pagination.pages ? { scale: 1.05 } : {}}
                                            whileTap={pagination.page !== pagination.pages ? tap : {}}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pagination.page === pagination.pages
                                                ? 'bg-white/5 text-purple-500 cursor-not-allowed'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            Next →
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </AnimatedBackground>
    );
};

export default MyTickets;
