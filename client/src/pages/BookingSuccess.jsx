import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { fadeIn, slideUp, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/6 last:border-0">
    <span className="text-green-400/80 text-sm">{label}</span>
    <span className="font-semibold text-white text-sm text-right max-w-[60%]">{value}</span>
  </div>
);

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) { navigate('/dashboard'); return; }
      effectRan.current = true;
      try {
        const res = await api.post('/payment/verify-payment', { sessionId });
        if (res.data.success) setBooking(res.data.data);
      } catch (err) {
        console.error('Error verifying payment:', err);
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <AnimatedBackground variant="green" className="flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-500"
        />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="green" className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(4,18,8,0.85)',
          border: '1px solid rgba(52,211,153,0.3)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 0 80px rgba(52,211,153,0.18), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Glows */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.3) 0%,transparent 70%)', filter: 'blur(24px)' }} />
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.25) 0%,transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(315deg,rgba(99,102,241,0.15) 0%,transparent 60%)' }} />

        {/* Header */}
        <div className="relative p-8 text-center border-b border-white/8"
          style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.1) 0%,rgba(99,102,241,0.06) 100%)' }}>
          <div className="absolute bottom-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(52,211,153,0.5),rgba(99,102,241,0.4),transparent)' }} />
          <motion.div
            className="text-7xl mb-4 inline-block"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
          >
            ✅
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-emerald-300 text-sm">Your booking is confirmed. A confirmation email is on its way.</p>
        </div>

        <div className="relative z-10 p-8">
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Booking Details</p>
              <DetailRow label="Booking ID" value={<span className="font-mono text-emerald-300">{booking.bookingId}</span>} />
              <DetailRow label="Museum" value={booking.museum?.name} />
              <DetailRow label="Date" value={new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
              <DetailRow label="Tickets" value={booking.ticketCount} />
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="text-white font-bold">Total Amount</span>
                <span className="text-2xl font-extrabold text-emerald-400">₹{booking.amount?.toLocaleString('en-IN')}</span>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(52,211,153,0.5)' }}
            whileTap={tap}
            className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#059669,#34d399,#3b82f6)', boxShadow: '0 0 30px rgba(52,211,153,0.35)' }}
          >
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
              animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} />
            <span className="relative z-10">🏠 Go to Dashboard</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default BookingSuccess;
