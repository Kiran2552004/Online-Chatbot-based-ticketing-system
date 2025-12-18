import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { slideInLeft, slideInRight, zoomIn, typingDots, dot, fadeIn, staggerContainer } from './animations/motions';

const ChatbotWindow = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 How can I assist you today? You can book museum tickets or create a support ticket.",
      timestamp: new Date(),
      id: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [payload, setPayload] = useState(null);
  const [museums, setMuseums] = useState([]);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get session ID from localStorage or generate one
  const getSessionId = () => {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
  };

  // Fetch museums
  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const response = await api.get('/museums');
        setMuseums(response.data.data);
      } catch (error) {
        console.error('Error fetching museums:', error);
      }
    };
    fetchMuseums();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText && !text) return;

    setInput('');
    setLoading(true);

    // Add user message
    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      id: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.post('/chat', {
        message: messageText,
        sessionId: getSessionId(),
        userId: user?._id || null,
      });

      const { reply, nextAction: action, payload: actionPayload } = response.data.data;

      // Add bot reply
      setTimeout(() => {
        const botMessage = {
          sender: 'bot',
          text: reply,
          timestamp: new Date(),
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 500);

      setNextAction(action);
      setPayload(actionPayload);

      // Reset UI selections if needed
      if (action === 'ASK_MUSEUM') {
        setSelectedMuseum(null);
        setSelectedDate('');
        setTicketCount(1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        id: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleMuseumSelect = (museum) => {
    setSelectedMuseum(museum);
    sendMessage(museum.name);
  };

  const handleDateSelect = () => {
    if (selectedDate) {
      sendMessage(selectedDate);
    }
  };

  const handleTicketCountChange = (delta) => {
    const newCount = Math.max(1, ticketCount + delta);
    setTicketCount(newCount);
  };

  const handleTicketCountSubmit = () => {
    sendMessage(ticketCount.toString());
  };

  const handleGoBack = () => {
    sendMessage('go back');
  };

  const handlePayment = async () => {
    if (!payload || !user) {
      // Show login message in chat instead of alert
      const loginMessage = {
        sender: 'bot',
        text: 'Please login to proceed with payment.',
        timestamp: new Date(),
        id: Date.now(),
      };
      setMessages((prev) => [...prev, loginMessage]);
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/payment/create-checkout-session', {
        museumId: payload.museumId,
        date: payload.date,
        ticketCount: payload.ticketCount,
        amount: payload.amount,
      });

      if (response.data.success && response.data.data.checkoutUrl) {
        // Redirect to Stripe checkout page
        window.location.href = response.data.data.checkoutUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Prevent any popups - handle error silently in chat
      console.error('Payment error:', error);
      setLoading(false);
      
      // Add error message to chat instead of showing popup
      const errorMessage = error.response?.data?.message || 'Unable to process payment at this time. Please try again later or contact support.';
      const errorBotMessage = {
        sender: 'bot',
        text: `Sorry, ${errorMessage}`,
        timestamp: new Date(),
        id: Date.now(),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4 relative overflow-hidden"
      initial="hidden"
      animate="show"
      variants={zoomIn}
    >
      {/* Floating bot avatar */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 hidden md:block"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl shadow-2xl cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.8)',
              '0 0 20px rgba(168, 85, 247, 0.4)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🤖
        </motion.div>
      </motion.div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6 relative overflow-hidden"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{
                translateX: ['0%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  className="text-3xl"
                >
                  🤖
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">AI Assistant</h2>
                  <p className="text-purple-100 text-sm mt-1">Bengaluru Museum Ticketing Support</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.8 }}
                  variants={msg.sender === 'user' ? slideInRight : slideInLeft}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  layout
                >
                  <motion.div
                    className={`max-w-[80%] rounded-3xl p-4 relative ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-lg border border-gray-100">
                    <motion.div className="flex space-x-2" variants={typingDots} initial="animate" animate="animate">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          variants={dot}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Special UI Elements */}
            <AnimatePresence>
              {nextAction === 'ASK_MUSEUM' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100"
                >
                  <p className="text-sm font-medium text-gray-700 mb-3">Select a museum:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {museums.map((museum) => (
                      <motion.button
                        key={museum._id}
                        onClick={() => handleMuseumSelect(museum)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-purple-50/50 hover:from-purple-50 hover:to-blue-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all"
                      >
                        <div className="font-semibold text-gray-800">{museum.name}</div>
                        <div className="text-sm text-gray-600">₹{museum.price} per ticket</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {nextAction === 'ASK_DATE' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100"
                >
                  <p className="text-sm font-medium text-gray-700 mb-3">Select date:</p>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                  <div className="flex gap-3 mt-3">
                    <motion.button
                      onClick={handleGoBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all shadow-md"
                    >
                      ← Go Back
                    </motion.button>
                    <motion.button
                      onClick={handleDateSelect}
                      disabled={!selectedDate}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Date
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {nextAction === 'ASK_TICKETS' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100"
                >
                  <p className="text-sm font-medium text-gray-700 mb-3">Number of tickets:</p>
                  <div className="flex items-center justify-center space-x-4">
                    <motion.button
                      onClick={() => handleTicketCountChange(-1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-lg transition-all shadow-md"
                    >
                      -
                    </motion.button>
                    <motion.span
                      className="text-3xl font-bold text-gray-800 w-16 text-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {ticketCount}
                    </motion.span>
                    <motion.button
                      onClick={() => handleTicketCountChange(1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-lg transition-all shadow-md"
                    >
                      +
                    </motion.button>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <motion.button
                      onClick={handleGoBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all shadow-md"
                    >
                      ← Go Back
                    </motion.button>
                    <motion.button
                      onClick={handleTicketCountSubmit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Confirm Tickets
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {nextAction === 'CONFIRM_BOOKING' && payload && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 rounded-2xl p-5 shadow-xl border-2 border-green-300"
                >
                  <p className="text-sm font-bold text-gray-800 mb-4">Booking Summary:</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Museum:</span>
                      <span className="font-semibold">{payload.museumName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">
                        {new Date(payload.date).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tickets:</span>
                      <span className="font-semibold">{payload.ticketCount}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-800 font-bold">Total Amount:</span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{payload.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleGoBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all shadow-md"
                    >
                      ← Go Back
                    </motion.button>
                    {user ? (
                      <motion.button
                        onClick={handlePayment}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 shadow-lg"
                      >
                        {loading ? 'Processing...' : '💳 Pay with Stripe'}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => navigate('/login')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all"
                      >
                        Login to Proceed
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <motion.div
            className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading && nextAction !== 'ASK_MUSEUM' && nextAction !== 'ASK_DATE' && nextAction !== 'ASK_TICKETS' && nextAction !== 'CONFIRM_BOOKING') {
                  sendMessage();
                }
              }}
              className="flex space-x-3"
            >
              <motion.div
                className="flex-1 relative"
                animate={{
                  scale: inputFocused ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Type your message..."
                  disabled={loading || nextAction === 'ASK_MUSEUM' || nextAction === 'ASK_DATE' || nextAction === 'ASK_TICKETS' || nextAction === 'CONFIRM_BOOKING'}
                  className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:bg-gray-100 ${
                    inputFocused ? 'border-purple-400 shadow-lg shadow-purple-200' : 'border-gray-300'
                  }`}
                />
              </motion.div>
              <motion.button
                type="submit"
                disabled={loading || !input.trim() || nextAction === 'ASK_MUSEUM' || nextAction === 'ASK_DATE' || nextAction === 'ASK_TICKETS' || nextAction === 'CONFIRM_BOOKING'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Send
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatbotWindow;
