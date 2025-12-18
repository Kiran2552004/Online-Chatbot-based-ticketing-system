import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { zoomIn, fadeIn, slideUp, tap } from '../components/animations/motions';

const BookingCancelled = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-white/20"
        variants={zoomIn}
      >
        <motion.div
          className="text-7xl mb-6"
          animate={{
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          ❌
        </motion.div>
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-4"
          variants={slideUp}
        >
          Payment Cancelled
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8"
          variants={fadeIn}
        >
          Your payment was cancelled. No charges were made. You can try again anytime.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={slideUp}
        >
          <motion.button
            onClick={() => navigate('/chat')}
            whileHover={{ scale: 1.05 }}
            whileTap={tap}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
          >
            Book Again
          </motion.button>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={tap}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all shadow-md"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BookingCancelled;
