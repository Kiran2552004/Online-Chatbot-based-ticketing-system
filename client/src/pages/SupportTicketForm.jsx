import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { tap } from '../components/animations/motions';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ISSUE_TYPES = [
    'Booking Issue',
    'Payment Problem',
    'Ticket Not Received',
    'Refund Request',
    'Website Bug',
    'Account Issue',
    'Museum Information',
    'General Enquiry',
    'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High'];

const PRIORITY_META = {
    Low: {
        gradient: 'from-emerald-400 to-teal-500',
        glow: 'shadow-emerald-500/40',
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-500/10',
        desc: 'Non-urgent · resolved within 7 days',
        icon: '🟢',
    },
    Medium: {
        gradient: 'from-amber-400 to-orange-500',
        glow: 'shadow-amber-500/40',
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/10',
        desc: 'Moderate · resolved within 3 days',
        icon: '🟠',
    },
    High: {
        gradient: 'from-red-400 to-rose-600',
        glow: 'shadow-red-500/40',
        border: 'border-red-500/50',
        bg: 'bg-red-500/10',
        desc: 'Urgent · resolved within 24 hours',
        icon: '🔴',
    },
};

/* ─────────────────────────────────────────────
   FLOATING PARTICLE
───────────────────────────────────────────── */
const Particle = ({ x, y, size, duration, delay, color }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            background: color,
            filter: 'blur(1px)',
        }}
        animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            opacity: [0, 0.8, 0],
            scale: [0.6, 1, 0.6],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
    />
);

/* ─────────────────────────────────────────────
   ANIMATED GRID CANVAS
───────────────────────────────────────────── */
const GridBackground = () => {
    const canvasRef = useRef(null);
    const frameRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = (t) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const spacing = 60;
            const cols = Math.ceil(canvas.width / spacing) + 1;
            const rows = Math.ceil(canvas.height / spacing) + 1;

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const x = c * spacing;
                    const y = r * spacing;
                    const dist = Math.sqrt(
                        Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
                    );
                    const pulse = Math.sin(t * 0.001 - dist * 0.01) * 0.5 + 0.5;
                    const alpha = pulse * 0.15;

                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(167,139,250,${alpha})`;
                    ctx.fill();
                }
            }

            // Draw faint grid lines
            ctx.strokeStyle = 'rgba(139,92,246,0.04)';
            ctx.lineWidth = 1;
            for (let c = 0; c < cols; c++) {
                ctx.beginPath();
                ctx.moveTo(c * spacing, 0);
                ctx.lineTo(c * spacing, canvas.height);
                ctx.stroke();
            }
            for (let r = 0; r < rows; r++) {
                ctx.beginPath();
                ctx.moveTo(0, r * spacing);
                ctx.lineTo(canvas.width, r * spacing);
                ctx.stroke();
            }

            animId = requestAnimationFrame(draw);
        };

        animId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 1 }}
        />
    );
};

/* ─────────────────────────────────────────────
   PARTICLES CONFIG
───────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 2,
    duration: Math.random() * 6 + 5,
    delay: Math.random() * 4,
    color: [
        'rgba(167,139,250,0.6)',
        'rgba(236,72,153,0.5)',
        'rgba(99,102,241,0.6)',
        'rgba(245,158,11,0.4)',
        'rgba(52,211,153,0.4)',
    ][Math.floor(Math.random() * 5)],
}));

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const SupportTicketForm = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ issueType: '', priority: 'Medium', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.issueType) return setError('Please select an issue type.');
        if (!form.description.trim()) return setError('Please describe your issue.');
        if (form.description.trim().length < 20)
            return setError('Description must be at least 20 characters.');

        setLoading(true);
        try {
            const res = await api.post('/support-tickets', form);
            if (res.data.success) {
                setSuccess({ ticketId: res.data.data.ticketId });
                setForm({ issueType: '', priority: 'Medium', description: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0118 0%, #0f0528 40%, #180a35 70%, #0a0118 100%)' }}
        >
            {/* ── Layer 1: Animated dot-grid canvas ── */}
            <GridBackground />

            {/* ── Layer 2: Floating particles ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {PARTICLES.map((p) => (
                    <Particle key={p.id} {...p} />
                ))}
            </div>

            {/* ── Layer 3: Large aurora blobs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top-left teal aurora */}
                <motion.div
                    className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                    animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Bottom-right pink aurora */}
                <motion.div
                    className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, rgba(217,70,239,0.10) 50%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                    animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 20, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                {/* Center indigo glow */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 60%)',
                        filter: 'blur(60px)',
                    }}
                    animate={{ scaleX: [1, 1.1, 1], scaleY: [1, 0.9, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                {/* Top-right amber accent */}
                <motion.div
                    className="absolute top-10 right-10 w-64 h-64 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                    }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                />
                {/* Bottom-left teal accent */}
                <motion.div
                    className="absolute bottom-10 left-10 w-56 h-56 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                    }}
                    animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                />
            </div>

            {/* ── Layer 4: Decorative rings ── */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {[400, 600, 800, 1000].map((size, i) => (
                    <motion.div
                        key={size}
                        className="absolute rounded-full border border-purple-500/5"
                        style={{ width: size, height: size }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.02, 1] }}
                        transition={{
                            rotate: { duration: 30 + i * 10, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i },
                        }}
                    />
                ))}
            </div>

            {/* ── Layer 5: Shooting stars ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute h-px"
                        style={{
                            top: `${20 + i * 25}%`,
                            left: '-10%',
                            width: '120px',
                            background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.8), transparent)',
                        }}
                        animate={{ x: ['0vw', '120vw'], opacity: [0, 1, 0] }}
                        transition={{
                            duration: 2.5,
                            delay: i * 4 + 2,
                            repeat: Infinity,
                            repeatDelay: 10,
                            ease: 'easeIn',
                        }}
                    />
                ))}
            </div>

            {/* ── CARD CONTENT ── */}
            <div className="relative z-10 w-full max-w-2xl">
                {/* Back button */}
                <motion.button
                    onClick={() => navigate('/dashboard')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ x: -4 }}
                    whileTap={tap}
                    className="mb-6 flex items-center gap-2 text-purple-300/80 hover:text-white transition-colors font-medium text-sm"
                >
                    <span className="text-lg">←</span> Back to Dashboard
                </motion.button>

                <AnimatePresence mode="wait">
                    {success ? (
                        /* ══════ SUCCESS CARD ══════ */
                        <motion.div
                            key="success"
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="relative rounded-3xl overflow-hidden text-center"
                            style={{
                                background: 'rgba(15,5,40,0.75)',
                                border: '1px solid rgba(139,92,246,0.3)',
                                backdropFilter: 'blur(24px)',
                                boxShadow: '0 0 80px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                            }}
                        >
                            {/* success glow ring */}
                            <div
                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                                    filter: 'blur(30px)',
                                }}
                            />

                            <div className="relative z-10 p-12">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
                                    className="text-7xl mb-6 inline-block"
                                >
                                    🎉
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold text-white mb-3"
                                >
                                    Ticket Created!
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-purple-300 mb-8"
                                >
                                    Your support ticket has been submitted. We'll get back to you soon.
                                </motion.p>

                                {/* Ticket ID box */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="relative rounded-2xl p-5 mb-6 overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))',
                                        border: '1px solid rgba(139,92,246,0.4)',
                                    }}
                                >
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl"
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
                                        }}
                                    />
                                    <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Your Ticket ID</p>
                                    <p className="text-3xl font-extrabold font-mono text-white tracking-[0.15em]">
                                        {success.ticketId}
                                    </p>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-purple-400 text-sm mb-8"
                                >
                                    📧 Confirmation sent to <span className="text-purple-200 font-semibold">{user?.email}</span>
                                </motion.p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <motion.button
                                        onClick={() => navigate('/my-tickets')}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
                                        whileTap={tap}
                                        className="px-8 py-3 rounded-xl font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                                    >
                                        View My Tickets
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setSuccess(null)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={tap}
                                        className="px-8 py-3 rounded-xl font-semibold text-purple-200 hover:text-white transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                                    >
                                        Submit Another
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* ══════ FORM CARD ══════ */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative rounded-3xl overflow-hidden"
                            style={{
                                background: 'rgba(10,5,28,0.80)',
                                border: '1px solid rgba(139,92,246,0.25)',
                                backdropFilter: 'blur(28px)',
                                boxShadow: '0 0 100px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
                            }}
                        >
                            {/* Inner corner accent lines */}
                            <div
                                className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, transparent 60%)',
                                }}
                            />
                            <div
                                className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(315deg, rgba(236,72,153,0.2) 0%, transparent 60%)',
                                }}
                            />

                            {/* ── Card Header ── */}
                            <div
                                className="relative p-8 border-b"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.08) 100%)',
                                    borderColor: 'rgba(139,92,246,0.2)',
                                }}
                            >
                                {/* Header glow */}
                                <div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)',
                                        filter: 'blur(20px)',
                                    }}
                                />

                                <div className="relative z-10 flex items-center gap-5">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="text-5xl"
                                    >
                                        🎫
                                    </motion.div>
                                    <div>
                                        <motion.h1
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-2xl font-bold text-white"
                                        >
                                            Create Support Ticket
                                        </motion.h1>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="text-purple-300 text-sm mt-0.5"
                                        >
                                            Hi <span className="text-white font-semibold">{user?.name}</span> — describe your issue and we'll help you out.
                                        </motion.p>
                                    </div>
                                </div>

                                {/* Horizontal divider gradient */}
                                <div
                                    className="absolute bottom-0 left-8 right-8 h-px"
                                    style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.5), rgba(236,72,153,0.4), transparent)' }}
                                />
                            </div>

                            {/* ── Form Body ── */}
                            <form onSubmit={handleSubmit} className="relative p-8 space-y-6">

                                {/* Issue Type */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                                        Issue Type <span className="text-pink-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="issueType"
                                            name="issueType"
                                            value={form.issueType}
                                            onChange={handleChange}
                                            className="w-full rounded-xl px-4 py-3 text-white appearance-none focus:outline-none transition-all"
                                            style={{
                                                background: 'rgba(139,92,246,0.08)',
                                                border: '1px solid rgba(139,92,246,0.25)',
                                                colorScheme: 'dark',
                                            }}
                                            onFocus={(e) => (e.target.style.border = '1px solid rgba(139,92,246,0.6)')}
                                            onBlur={(e) => (e.target.style.border = '1px solid rgba(139,92,246,0.25)')}
                                        >
                                            <option value="" className="bg-[#0f0528]">— Select Issue Type —</option>
                                            {ISSUE_TYPES.map((t) => (
                                                <option key={t} value={t} className="bg-[#0f0528]">{t}</option>
                                            ))}
                                        </select>
                                        {/* custom chevron */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 text-xs">▼</div>
                                    </div>
                                </motion.div>

                                {/* Priority Selector */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
                                        Priority <span className="text-pink-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {PRIORITIES.map((p, i) => {
                                            const meta = PRIORITY_META[p];
                                            const selected = form.priority === p;
                                            return (
                                                <motion.button
                                                    key={p}
                                                    type="button"
                                                    id={`priority-${p.toLowerCase()}`}
                                                    onClick={() => setForm({ ...form, priority: p })}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.06 }}
                                                    whileHover={{ scale: 1.04, y: -2 }}
                                                    whileTap={tap}
                                                    className="relative rounded-xl p-3 text-left transition-all overflow-hidden"
                                                    style={{
                                                        background: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                                        border: selected
                                                            ? '1px solid rgba(139,92,246,0.5)'
                                                            : '1px solid rgba(255,255,255,0.08)',
                                                        boxShadow: selected ? '0 0 20px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                                                    }}
                                                >
                                                    {/* selected glow */}
                                                    {selected && (
                                                        <motion.div
                                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))' }}
                                                        />
                                                    )}
                                                    <div className="relative z-10 flex items-center gap-2 mb-1">
                                                        <div
                                                            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${meta.gradient} flex-shrink-0`}
                                                            style={{ boxShadow: selected ? `0 0 8px rgba(139,92,246,0.6)` : 'none' }}
                                                        />
                                                        <span className="font-semibold text-white text-sm">{p}</span>
                                                        {selected && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="ml-auto text-purple-400 text-xs font-bold"
                                                            >
                                                                ✓
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-purple-400 leading-tight relative z-10">{meta.desc}</p>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                                        Description <span className="text-pink-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Please describe your issue in detail… (min. 20 characters)"
                                            className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-500/60 resize-none focus:outline-none transition-all"
                                            style={{
                                                background: 'rgba(139,92,246,0.06)',
                                                border: '1px solid rgba(139,92,246,0.22)',
                                            }}
                                            onFocus={(e) => (e.target.style.border = '1px solid rgba(139,92,246,0.55)')}
                                            onBlur={(e) => (e.target.style.border = '1px solid rgba(139,92,246,0.22)')}
                                        />
                                        {/* char progress bar */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex-1 h-0.5 rounded-full overflow-hidden mr-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        background: form.description.length >= 20
                                                            ? 'linear-gradient(to right, #7c3aed, #db2777)'
                                                            : 'linear-gradient(to right, #ef4444, #f97316)',
                                                    }}
                                                    animate={{ width: `${Math.min((form.description.length / 20) * 100, 100)}%` }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            </div>
                                            <p className="text-purple-500 text-[11px] flex-shrink-0">
                                                {form.description.length} / 20 min
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                                            style={{
                                                background: 'rgba(239,68,68,0.12)',
                                                border: '1px solid rgba(239,68,68,0.3)',
                                                color: 'rgba(252,165,165,1)',
                                            }}
                                        >
                                            <span className="text-lg">⚠️</span>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    id="submit-ticket-btn"
                                    disabled={loading}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={!loading ? {
                                        scale: 1.02,
                                        boxShadow: '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(236,72,153,0.2)',
                                    } : {}}
                                    whileTap={!loading ? tap : {}}
                                    className="relative w-full py-4 rounded-xl font-bold text-white text-base overflow-hidden transition-all"
                                    style={{
                                        background: loading
                                            ? 'rgba(109,40,217,0.3)'
                                            : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #db2777 100%)',
                                        boxShadow: loading ? 'none' : '0 0 30px rgba(139,92,246,0.35)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {/* shimmer sweep */}
                                    {!loading && (
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                                            }}
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                                                    className="inline-block w-5 h-5 border-2 border-white/25 border-t-white rounded-full"
                                                />
                                                Submitting…
                                            </>
                                        ) : (
                                            '🎫 Submit Support Ticket'
                                        )}
                                    </span>
                                </motion.button>

                                {/* Footer link */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-center text-purple-500 text-sm"
                                >
                                    Already submitted?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/my-tickets')}
                                        className="text-purple-300 hover:text-white underline underline-offset-2 transition-colors"
                                    >
                                        View my tickets
                                    </button>
                                </motion.p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SupportTicketForm;
