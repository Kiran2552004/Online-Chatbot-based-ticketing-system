import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { fadeIn, slideUp, staggerContainer, hoverScale, tap } from '../components/animations/motions';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <motion.div
          className="text-center text-white"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Main Title */}
          <motion.h1
            variants={slideUp}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Bengaluru Museum
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 animate-gradient">
              Ticketing System
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl lg:text-3xl mb-16 max-w-4xl mx-auto opacity-90 leading-relaxed font-light"
          >
            Discover the rich cultural heritage of Bengaluru with our AI-powered booking platform.
            <span className="block mt-3 text-lg md:text-xl opacity-80">
              Book museum tickets instantly and get instant support.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={slideUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
          >
            {user ? (
              <>
                <motion.div
                  whileHover={hoverScale}
                  whileTap={tap}
                >
                  <Link
                    to="/dashboard"
                    className="group relative bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Go to Dashboard
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                  </Link>
                </motion.div>
                <motion.button
                  onClick={() => navigate('/chat')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-gray-900 px-10 py-5 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                        '0 0 40px rgba(251, 191, 36, 0.8)',
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      🤖
                    </motion.span>
                    Chat with Support
                  </span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={hoverScale}
                  whileTap={tap}
                >
                  <Link
                    to="/login"
                    className="group relative bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login / Register
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                  </Link>
                </motion.div>
                <motion.button
                  onClick={() => navigate('/chat')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-gray-900 px-10 py-5 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                        '0 0 40px rgba(251, 191, 36, 0.8)',
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      🤖
                    </motion.span>
                    Chat with Support
                  </span>
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: '🎫',
                title: 'Easy Booking',
                description: 'Book museum tickets in minutes with our streamlined process',
                gradient: 'from-blue-500/20 to-cyan-500/20',
              },
              {
                icon: '🤖',
                title: 'AI Assistant',
                description: 'Get instant help from our AI-powered chatbot',
                gradient: 'from-purple-500/20 to-pink-500/20',
              },
              {
                icon: '💳',
                title: 'Secure Payment',
                description: 'Safe and secure payment processing with Stripe',
                gradient: 'from-green-500/20 to-emerald-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <motion.div
                    className="text-5xl mb-4 inline-block"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="opacity-90 leading-relaxed">{feature.description}</p>
                </div>
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
