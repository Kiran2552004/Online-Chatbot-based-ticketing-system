import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { fadeIn, slideUp, staggerContainer, hoverScale, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <AnimatedBackground variant="purple">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <motion.div
          className="text-center text-white"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="flex justify-center mb-8">
            <span
              className="px-5 py-2 rounded-full text-sm font-semibold text-purple-200 border border-purple-500/40"
              style={{ background: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(8px)' }}
            >
              🏛️ Bengaluru Museum Ticketing System
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={slideUp}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight"
          >
            <span className="text-white">Explore Our</span>
            <span
              className="block mt-2 text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg,#c084fc,#f472b6,#fb923c)' }}
            >
              Cultural Heritage
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto text-purple-200/80 leading-relaxed font-light"
          >
            Discover the rich history of Bengaluru with our AI-powered booking platform.
            Book tickets instantly, get live support, and enjoy a seamless experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={slideUp}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
          >
            {user ? (
              <>
                <motion.div whileHover={hoverScale} whileTap={tap}>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white text-lg shadow-2xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg,#7c3aed,#a855f7,#db2777)',
                      boxShadow: '0 0 40px rgba(139,92,246,0.4)',
                    }}
                  >
                    🗺️ Go to Dashboard
                  </Link>
                </motion.div>
                <motion.button
                  onClick={() => navigate('/chat')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-white text-lg transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>🤖</motion.span>
                  Chat with Support
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={hoverScale} whileTap={tap}>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white text-lg shadow-2xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg,#7c3aed,#a855f7,#db2777)',
                      boxShadow: '0 0 40px rgba(139,92,246,0.4)',
                    }}
                  >
                    ✨ Login / Register
                  </Link>
                </motion.div>
                <motion.button
                  onClick={() => navigate('/chat')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-white text-lg transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>🤖</motion.span>
                  Chat with Support
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              { icon: '🎫', title: 'Easy Booking', desc: 'Book museum tickets in minutes with our streamlined AI-assisted process', accent: 'from-purple-500/20 to-indigo-500/20', border: 'rgba(139,92,246,0.3)' },
              { icon: '🤖', title: 'AI Assistant', desc: 'Get instant answers and booking help from our smart chatbot anytime', accent: 'from-pink-500/20 to-rose-500/20', border: 'rgba(236,72,153,0.3)' },
              { icon: '💳', title: 'Secure Payment', desc: 'Safe and encrypted payment processing powered by Stripe', accent: 'from-emerald-500/20 to-teal-500/20', border: 'rgba(52,211,153,0.3)' },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={slideUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative rounded-3xl p-7 overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${f.border}`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}
                />
                <div className="relative z-10">
                  <motion.div
                    className="text-5xl mb-4 inline-block"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-purple-300/80 text-sm leading-relaxed">{f.desc}</p>
                </div>
                {/* shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Landing;
