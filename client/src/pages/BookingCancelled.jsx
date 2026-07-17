import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { zoomIn, fadeIn, slideUp, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const BookingCancelled = () => {
  const navigate = useNavigate();

  return (
    <AnimatedBackground variant="red" className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden text-center"
        style={{
          background: 'rgba(18,5,5,0.82)',
          border: '1px solid rgba(239,68,68,0.3)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 0 80px rgba(239,68,68,0.18), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(239,68,68,0.3) 0%,transparent 70%)', filter: 'blur(24px)' }} />
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.25) 0%,transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(315deg,rgba(217,70,239,0.15) 0%,transparent 60%)' }} />

        <div className="relative z-10 p-10">
          <motion.div
            className="text-7xl mb-5 inline-block"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            ❌
          </motion.div>
          <motion.h1 variants={slideUp} initial="hidden" animate="show" className="text-3xl font-bold text-white mb-3">
            Payment Cancelled
          </motion.h1>
          <motion.p variants={fadeIn} initial="hidden" animate="show" className="text-red-300 mb-8 leading-relaxed">
            Your payment was cancelled. No charges were made.
            <br />You can try again anytime.
          </motion.p>

          <div className="h-px mb-8" style={{ background: 'linear-gradient(to right,transparent,rgba(239,68,68,0.4),transparent)' }} />

          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => navigate('/chat')}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
              whileTap={tap}
              className="px-8 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              🔄 Book Again
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={tap}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default BookingCancelled;
