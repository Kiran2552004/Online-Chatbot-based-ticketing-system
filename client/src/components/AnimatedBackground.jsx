import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ─── Canvas pulse-dot grid ─── */
const GridCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);
        const draw = (t) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const sp = 60;
            const cols = Math.ceil(canvas.width / sp) + 1;
            const rows = Math.ceil(canvas.height / sp) + 1;
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const x = c * sp, y = r * sp;
                    const dist = Math.hypot(x - canvas.width / 2, y - canvas.height / 2);
                    const pulse = Math.sin(t * 0.001 - dist * 0.011) * 0.5 + 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(167,139,250,${pulse * 0.14})`;
                    ctx.fill();
                }
            }
            ctx.strokeStyle = 'rgba(139,92,246,0.035)';
            ctx.lineWidth = 1;
            for (let c = 0; c < cols; c++) { ctx.beginPath(); ctx.moveTo(c * sp, 0); ctx.lineTo(c * sp, canvas.height); ctx.stroke(); }
            for (let r = 0; r < rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * sp); ctx.lineTo(canvas.width, r * sp); ctx.stroke(); }
            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ─── Config ─── */
const PARTICLE_COLORS = [
    'rgba(167,139,250,0.65)',
    'rgba(236,72,153,0.55)',
    'rgba(99,102,241,0.6)',
    'rgba(245,158,11,0.45)',
    'rgba(52,211,153,0.45)',
];

/**
 * AnimatedBackground
 * Props:
 *   variant  — 'purple' (default) | 'green' | 'red' | 'neutral'
 *   children — page content rendered on top (position: relative z-10)
 *   className — extra classes for the outer wrapper
 */
const AnimatedBackground = ({ children, variant = 'purple', className = '' }) => {

    /* Per-variant base + aurora colours */
    const theme = useMemo(() => ({
        purple: {
            base: 'linear-gradient(135deg,#0a0118 0%,#0f0528 40%,#180a35 70%,#0a0118 100%)',
            aurora1: 'rgba(139,92,246,0.25)',
            aurora2: 'rgba(236,72,153,0.22)',
            aurora3: 'rgba(99,102,241,0.10)',
            aurora4: 'rgba(245,158,11,0.12)',
            aurora5: 'rgba(52,211,153,0.12)',
        },
        green: {
            base: 'linear-gradient(135deg,#011a0a 0%,#042810 40%,#06350f 70%,#011a0a 100%)',
            aurora1: 'rgba(52,211,153,0.25)',
            aurora2: 'rgba(16,185,129,0.22)',
            aurora3: 'rgba(99,102,241,0.08)',
            aurora4: 'rgba(251,191,36,0.12)',
            aurora5: 'rgba(139,92,246,0.10)',
        },
        red: {
            base: 'linear-gradient(135deg,#1a0205 0%,#2d0510 40%,#1a0205 100%)',
            aurora1: 'rgba(239,68,68,0.25)',
            aurora2: 'rgba(244,63,94,0.22)',
            aurora3: 'rgba(217,70,239,0.10)',
            aurora4: 'rgba(251,146,60,0.12)',
            aurora5: 'rgba(139,92,246,0.08)',
        },
        neutral: {
            base: 'linear-gradient(135deg,#080b12 0%,#0e1528 40%,#0c1020 70%,#080b12 100%)',
            aurora1: 'rgba(99,102,241,0.22)',
            aurora2: 'rgba(139,92,246,0.18)',
            aurora3: 'rgba(59,130,246,0.10)',
            aurora4: 'rgba(20,184,166,0.10)',
            aurora5: 'rgba(236,72,153,0.08)',
        },
    })[variant], [variant]);

    const particles = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        duration: Math.random() * 6 + 5,
        delay: Math.random() * 4,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    })), []);

    return (
        <div
            className={`relative min-h-screen overflow-hidden ${className}`}
            style={{ background: theme.base }}
        >
            {/* Layer 1 — canvas dot grid */}
            <GridCanvas />

            {/* Layer 2 — floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, filter: 'blur(1px)' }}
                        animate={{ y: [0, -30, 0], x: [0, 14, -14, 0], opacity: [0, 0.8, 0], scale: [0.6, 1, 0.6] }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* Layer 3 — aurora blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
                    style={{ background: `radial-gradient(circle,${theme.aurora1} 0%,transparent 70%)`, filter: 'blur(40px)' }}
                    animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
                    style={{ background: `radial-gradient(circle,${theme.aurora2} 0%,transparent 70%)`, filter: 'blur(40px)' }}
                    animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 20, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
                    style={{ background: `radial-gradient(ellipse,${theme.aurora3} 0%,transparent 60%)`, filter: 'blur(60px)' }}
                    animate={{ scaleX: [1, 1.1, 1], scaleY: [1, 0.9, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
                <motion.div className="absolute top-10 right-10 w-64 h-64 rounded-full"
                    style={{ background: `radial-gradient(circle,${theme.aurora4} 0%,transparent 70%)`, filter: 'blur(30px)' }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
                <motion.div className="absolute bottom-10 left-10 w-56 h-56 rounded-full"
                    style={{ background: `radial-gradient(circle,${theme.aurora5} 0%,transparent 70%)`, filter: 'blur(30px)' }}
                    animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />
            </div>

            {/* Layer 4 — rotating rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {[400, 600, 800, 1050].map((size, i) => (
                    <motion.div key={size} className="absolute rounded-full"
                        style={{ width: size, height: size, border: '1px solid rgba(139,92,246,0.05)' }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.02, 1] }}
                        transition={{
                            rotate: { duration: 30 + i * 10, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i },
                        }} />
                ))}
            </div>

            {/* Layer 5 — shooting stars */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="absolute h-px"
                        style={{
                            top: `${18 + i * 24}%`,
                            left: '-10%',
                            width: '120px',
                            background: 'linear-gradient(to right,transparent,rgba(167,139,250,0.8),transparent)',
                        }}
                        animate={{ x: ['0vw', '120vw'], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.5, delay: i * 4 + 1.5, repeat: Infinity, repeatDelay: 10, ease: 'easeIn' }} />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;
