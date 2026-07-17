import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { slideUp, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const STATUS_STEPS = ['Open', 'In Progress', 'Resolved'];

const STATUS_STYLES = {
    Open: { badge: 'bg-amber-100 text-amber-800', icon: '🟡', text: 'Open' },
    'In Progress': { badge: 'bg-blue-100 text-blue-800', icon: '🔵', text: 'In Progress' },
    Resolved: { badge: 'bg-emerald-100 text-emerald-800', icon: '✅', text: 'Resolved' },
};

const PRIORITY_STYLES = {
    High: { badge: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '🔴' },
    Medium: { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: '🟠' },
    Low: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🟢' },
};

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/support-tickets/${id}`);
                setTicket(res.data.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Ticket not found.');
                } else if (err.response?.status === 403) {
                    setError('You are not authorized to view this ticket.');
                } else {
                    setError(err.response?.data?.message || 'Failed to load ticket details.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const currentStep = ticket ? STATUS_STEPS.indexOf(ticket.status) : 0;

    return (
        <AnimatedBackground variant="purple">
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Back */}
                    <motion.button
                        onClick={() => navigate('/my-tickets')}
                        whileHover={{ x: -4 }}
                        whileTap={tap}
                        className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors font-medium"
                    >
                        ← Back to My Tickets
                    </motion.button>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-32">
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
                            className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl px-8 py-8 text-center"
                        >
                            <div className="text-5xl mb-4">😕</div>
                            <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                            <p className="mb-6">{error}</p>
                            <motion.button
                                onClick={() => navigate('/my-tickets')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={tap}
                                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold"
                            >
                                Go Back
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Ticket Details */}
                    {!loading && ticket && (
                        <motion.div variants={slideUp} className="space-y-6">
                            {/* Header Card */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 border-b border-white/10 p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-purple-300 text-sm font-semibold mb-1">TICKET ID</p>
                                            <h1 className="text-2xl font-bold font-mono text-white">{ticket.ticketId}</h1>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {/* Priority badge */}
                                            {ticket.priority && PRIORITY_STYLES[ticket.priority] && (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${PRIORITY_STYLES[ticket.priority]?.badge}`}
                                                >
                                                    {PRIORITY_STYLES[ticket.priority]?.icon} {ticket.priority} Priority
                                                </span>
                                            )}
                                            {/* Status badge */}
                                            {ticket.status && STATUS_STYLES[ticket.status] && (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_STYLES[ticket.status]?.badge}`}
                                                >
                                                    {STATUS_STYLES[ticket.status]?.icon} {STATUS_STYLES[ticket.status]?.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* Status Timeline */}
                                    <div>
                                        <p className="text-purple-300 text-sm font-semibold mb-4 uppercase tracking-wider">
                                            Status Progress
                                        </p>
                                        <div className="flex items-center gap-0">
                                            {STATUS_STEPS.map((step, idx) => {
                                                const done = idx <= currentStep;
                                                const active = idx === currentStep;
                                                return (
                                                    <div key={step} className="flex items-center flex-1">
                                                        <div className="flex flex-col items-center">
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: idx * 0.15 }}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done
                                                                    ? 'bg-purple-600 border-purple-500 text-white'
                                                                    : 'bg-white/5 border-white/20 text-purple-500'
                                                                    } ${active ? 'ring-4 ring-purple-500/30' : ''}`}
                                                            >
                                                                {done ? '✓' : idx + 1}
                                                            </motion.div>
                                                            <span
                                                                className={`text-xs mt-2 font-medium ${done ? 'text-purple-300' : 'text-purple-600'
                                                                    }`}
                                                            >
                                                                {step}
                                                            </span>
                                                        </div>
                                                        {idx < STATUS_STEPS.length - 1 && (
                                                            <motion.div
                                                                initial={{ scaleX: 0 }}
                                                                animate={{ scaleX: idx < currentStep ? 1 : 0 }}
                                                                transition={{ delay: idx * 0.15 + 0.1 }}
                                                                className="flex-1 h-0.5 bg-purple-600 origin-left mx-1"
                                                                style={{
                                                                    background:
                                                                        idx < currentStep
                                                                            ? 'linear-gradient(to right, #7c3aed, #db2777)'
                                                                            : 'rgba(255,255,255,0.1)',
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DetailCard label="Issue Type" value={ticket.issueType} icon="🏷️" />
                                        <DetailCard
                                            label="Submitted By"
                                            value={ticket.name}
                                            sub={ticket.email}
                                            icon="👤"
                                        />
                                        <DetailCard
                                            label="Created"
                                            value={new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                            icon="📅"
                                        />
                                        <DetailCard
                                            label="Last Updated"
                                            value={new Date(ticket.updatedAt).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                            icon="🔄"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-3">
                                            📄 Description
                                        </p>
                                        <p className="text-white leading-relaxed whitespace-pre-wrap">
                                            {ticket.description}
                                        </p>
                                    </div>

                                    {/* Status Info */}
                                    {ticket.status === 'Resolved' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4"
                                        >
                                            <span className="text-3xl">✅</span>
                                            <div>
                                                <p className="font-semibold text-emerald-300">Ticket Resolved</p>
                                                <p className="text-emerald-400 text-sm">
                                                    This ticket has been resolved by our team. Thank you for your patience!
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {ticket.status === 'In Progress' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-500/20 border border-blue-500/40 rounded-2xl p-5 flex items-center gap-4"
                                        >
                                            <span className="text-3xl">🔵</span>
                                            <div>
                                                <p className="font-semibold text-blue-300">In Progress</p>
                                                <p className="text-blue-400 text-sm">
                                                    Our team is actively working on your issue. We'll update you soon.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    onClick={() => navigate('/my-tickets')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={tap}
                                    className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                                >
                                    ← All Tickets
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate('/support-ticket')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={tap}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all"
                                >
                                    + Create New Ticket
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AnimatedBackground>
    );
};

// Small helper component
const DetailCard = ({ label, value, sub, icon }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            {icon} {label}
        </p>
        <p className="text-white font-medium">{value}</p>
        {sub && <p className="text-purple-300 text-sm mt-0.5">{sub}</p>}
    </div>
);

export default TicketDetails;
