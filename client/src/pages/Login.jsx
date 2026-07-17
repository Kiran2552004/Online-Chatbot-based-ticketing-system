import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { slideUp, tap } from '../components/animations/motions';
import AnimatedBackground from '../components/AnimatedBackground';

/* Shared glass input style */
const inputStyle = {
  background: 'rgba(139,92,246,0.08)',
  border: '1px solid rgba(139,92,246,0.25)',
  color: 'white',
};
const inputFocus = (e) => (e.target.style.border = '1px solid rgba(139,92,246,0.6)');
const inputBlur = (e) => (e.target.style.border = '1px solid rgba(139,92,246,0.25)');

const EyeIcon = ({ open }) => open ? (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) navigate('/');
    else setError(result.message);
    setLoading(false);
  };

  return (
    <AnimatedBackground variant="purple" className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,5,28,0.80)',
          border: '1px solid rgba(139,92,246,0.28)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 0 80px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.3) 0%,transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none" style={{ background: 'linear-gradient(315deg,rgba(236,72,153,0.2) 0%,transparent 60%)' }} />

        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-white/8" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12) 0%,rgba(236,72,153,0.06) 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(139,92,246,0.2) 0%,transparent 70%)', filter: 'blur(16px)' }} />
          <div className="relative z-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="text-4xl mb-3">🔐</motion.div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-purple-300 text-sm mt-1">Sign in to your account</p>
          </div>
          <div className="absolute bottom-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(139,92,246,0.5),rgba(236,72,153,0.4),transparent)' }} />
        </div>

        <div className="p-8 space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(252,165,165,1)' }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={slideUp}>
              <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all placeholder-purple-500/50"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </motion.div>

            <motion.div variants={slideUp}>
              <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all placeholder-purple-500/50"
                  style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                <motion.button type="button" onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors">
                  <EyeIcon open={showPassword} />
                </motion.button>
              </div>
            </motion.div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 40px rgba(139,92,246,0.5)' } : {}}
              whileTap={!loading ? tap : {}}
              className="relative w-full py-3.5 rounded-xl font-bold text-white overflow-hidden"
              style={{
                background: loading ? 'rgba(109,40,217,0.3)' : 'linear-gradient(135deg,#7c3aed,#a855f7,#db2777)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(139,92,246,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {!loading && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/25 border-t-white rounded-full" /> Signing in…</>) : '✨ Sign In'}
              </span>
            </motion.button>
          </form>

          <div className="space-y-3 pt-2">
            <p className="text-center text-purple-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-300 hover:text-white underline underline-offset-2 transition-colors font-semibold">Register here</Link>
            </p>
            <div className="border-t border-white/8 pt-4">
              <p className="text-center text-xs text-purple-500 mb-3 uppercase tracking-wider">Admin Access</p>
              <Link to="/admin/login"
                className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all text-purple-200 hover:text-white"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                🔐 Admin Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default Login;
