import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { zoomIn, fadeIn, slideUp, tap } from '../components/animations/motions';

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
      const bookingId = searchParams.get('booking_id');

      if (!sessionId) {
        navigate('/dashboard');
        return;
      }

      effectRan.current = true;

      try {
        const response = await api.post('/payment/verify-payment', { sessionId });
        if (response.data.success) {
          setBooking(response.data.data);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center border border-white/20"
        variants={zoomIn}
      >
        <motion.div
          className="text-7xl mb-6"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          ✅
        </motion.div>
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-4"
          variants={slideUp}
        >
          Payment Successful!
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8"
          variants={fadeIn}
        >
          Your booking has been confirmed. You will receive a confirmation email shortly.
        </motion.p>

        {booking && (
          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 text-left border-2 border-green-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono font-semibold text-purple-600">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Museum:</span>
                <span className="font-semibold">{booking.museum?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(booking.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets:</span>
                <span className="font-semibold">{booking.ticketCount}</span>
              </div>
              <div className="flex justify-between border-t pt-3 mt-3">
                <span className="text-gray-800 font-bold text-lg">Total Amount:</span>
                <span className="font-bold text-green-600 text-xl">
                  ₹{booking.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={tap}
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white px-10 py-4 rounded-xl font-bold hover:shadow-xl transition-all shadow-lg"
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BookingSuccess;
