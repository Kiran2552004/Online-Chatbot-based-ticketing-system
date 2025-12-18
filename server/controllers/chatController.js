import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatSession from '../models/ChatSession.js';
import Museum from '../models/Museum.js';
import MuseumBooking from '../models/MuseumBooking.js';
import SupportTicket from '../models/SupportTicket.js';
import { generateTicketId } from '../utils/generateTicketId.js';
import { sendSupportTicketConfirmation } from '../utils/emailService.js';

// Initialize Gemini AI (only used as fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================
// UTILITY FUNCTIONS
// ============================================

const normalizeMessage = (message) => {
  return message.toLowerCase().trim();
};

// ============================================
// RULE-BASED INTENT DETECTION (NO GEMINI)
// ============================================

const isGreeting = (message) => {
  // More comprehensive greeting detection - checks for exact word matches or common phrases
  const normalized = normalizeMessage(message);
  
  // Exact word matches (handles standalone greetings)
  const exactGreetings = ['hi', 'hello', 'hey', 'hai', 'yo', 'greetings', 'greeting'];
  if (exactGreetings.some(greeting => normalized === greeting)) {
    return true;
  }
  
  // Phrase matches (handles greetings in sentences)
  const greetingPhrases = ['good morning', 'good afternoon', 'good evening', 'good night', 'good day'];
  if (greetingPhrases.some(phrase => normalized.includes(phrase))) {
    return true;
  }
  
  // Check if message starts with or contains standalone greeting words
  const words = normalized.split(/\s+/);
  const greetingWords = ['hi', 'hello', 'hey', 'hai'];
  if (words.some(word => greetingWords.includes(word))) {
    return true;
  }
  
  return false;
};

const wantsBooking = (message) => {
  const normalized = normalizeMessage(message);
  
  // Exact word matches for booking-related standalone words
  const exactBookingWords = ['ticket', 'tickets', 'book', 'booking', 'museum'];
  const words = normalized.split(/\s+/);
  
  // Check for standalone booking words (very permissive)
  if (words.some(word => exactBookingWords.includes(word))) {
    return true;
  }
  
  // Phrase matches
  const bookingPhrases = [
    'book ticket', 'book tickets', 'museum tickets', 'i want to book', 
    'want to book', 'book museum', 'book a ticket', 'book a museum', 
    'new booking', 'make booking', 'buy ticket', 'reserve ticket',
    'buy tickets', 'reserve tickets', 'get tickets', 'get ticket',
    'i want tickets', 'i need tickets', 'i need ticket', 'i want ticket'
  ];
  
  if (bookingPhrases.some(phrase => normalized.includes(phrase))) {
    return true;
  }
  
  return false;
};

const wantsSupportTicket = (message) => {
  const keywords = ['create support ticket', 'raise complaint', 'support ticket', 'file complaint', 'create ticket', 'help ticket'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsMyBookings = (message) => {
  const keywords = ['show my bookings', 'my bookings', 'my tickets', 'show bookings', 'booking history', 'view bookings', 'list bookings'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsDownloadTicket = (message) => {
  const keywords = ['download ticket', 'download my ticket', 'get ticket pdf', 'ticket pdf', 'download pdf'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsMuseumList = (message) => {
  const keywords = ['what museums', 'list museums', 'show museums', 'available museums', 'museums available', 'which museums'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsHelp = (message) => {
  const keywords = ['help', 'i need help', 'assistance', 'support', 'how can you help'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsCancel = (message) => {
  const keywords = ['cancel', 'stop', 'nevermind', 'never mind', 'no thanks', 'no thank you', 'exit', 'quit'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized.includes(keyword));
};

const wantsGoBack = (message) => {
  const keywords = ['go back', 'back', 'undo', 'previous', 'change', 'modify', 'edit'];
  const normalized = normalizeMessage(message);
  return keywords.some(keyword => normalized === keyword || normalized.includes(keyword));
};

const isConfirmation = (message) => {
  const confirmKeywords = ['yes', 'y', 'ok', 'okay', 'confirm', 'proceed', 'continue', 'pay', 'payment', 'sure', 'go ahead'];
  const normalized = normalizeMessage(message);
  return confirmKeywords.some(kw => normalized === kw || normalized.includes(kw));
};

// ============================================
// DATE PARSING (RULE-BASED)
// ============================================

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const normalized = dateStr.trim();
  
  // Try standard ISO format (YYYY-MM-DD) - most common from date picker
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(isoMatch[0]);
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = normalized.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return date;
  }

  // Try MM-DD-YYYY or MM/DD/YYYY
  const mmddyyyyMatch = normalized.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return date;
  }

  // Try natural language dates (today, tomorrow, next week, etc.)
  const lower = normalized.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (lower.includes('today')) {
    return new Date(today);
  }
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (lower.includes('day after tomorrow')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter;
  }

  // Try native Date parsing as fallback
  const parsed = new Date(normalized);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

const isValidFutureDate = (date) => {
  if (!date || isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date >= today;
};

// ============================================
// NUMBER/TICKET COUNT PARSING (RULE-BASED)
// ============================================

const extractTicketCount = (message) => {
  // Try to find a number in the message
  const numberMatch = message.match(/\d+/);
  if (numberMatch) {
    const count = parseInt(numberMatch[0], 10);
    if (count > 0 && count <= 100) { // Reasonable limit
      return count;
    }
  }

  // Try word-based numbers
  const normalized = normalizeMessage(message);
  const wordNumbers = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'single': 1, 'double': 2, 'couple': 2, 'few': 3
  };

  for (const [word, num] of Object.entries(wordNumbers)) {
    if (normalized.includes(word)) {
      return num;
    }
  }

  return null;
};

// ============================================
// MUSEUM MATCHING (RULE-BASED)
// ============================================

const getMuseumByName = async (message) => {
  const museums = await Museum.find({ isActive: true });
  const normalizedMessage = normalizeMessage(message.trim());
  
  // Try exact match first (by name or slug)
  for (const museum of museums) {
    const museumNameNormalized = normalizeMessage(museum.name);
    const museumSlugNormalized = museum.slug ? normalizeMessage(museum.slug) : '';
    
    if (normalizedMessage === museumNameNormalized || normalizedMessage === museumSlugNormalized) {
      return museum;
    }
  }
  
  // Try partial match (message contains museum name or vice versa)
  for (const museum of museums) {
    const museumNameNormalized = normalizeMessage(museum.name);
    const museumSlugNormalized = museum.slug ? normalizeMessage(museum.slug) : '';
    
    if (normalizedMessage.includes(museumNameNormalized) || museumNameNormalized.includes(normalizedMessage) ||
        normalizedMessage.includes(museumSlugNormalized) || museumSlugNormalized.includes(normalizedMessage)) {
      // Only return if it's a substantial match (at least 3 characters)
      if (museumNameNormalized.length >= 3 && normalizedMessage.length >= 3) {
        return museum;
      }
    }
  }
  
  // Try word-by-word matching for better results
  const messageWords = normalizedMessage.split(/\s+/).filter(w => w.length > 2);
  for (const museum of museums) {
    const museumNameNormalized = normalizeMessage(museum.name);
    const museumWords = museumNameNormalized.split(/\s+/).filter(w => w.length > 2);
    const matchingWords = messageWords.filter(word => museumWords.includes(word));
    
    // If at least 2 words match or most words match, consider it a match
    if (matchingWords.length >= 2 || (messageWords.length > 0 && matchingWords.length / messageWords.length >= 0.5)) {
      return museum;
    }
  }
  
  return null;
};

// ============================================
// GEMINI FALLBACK (ONLY WHEN NO RULE APPLIES)
// ============================================

const getAIResponse = async (message, sessionContext = {}) => {
  try {
    // Check if API key is available - return helpful fallback instead of error
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      console.warn('⚠️  GEMINI_API_KEY is not set or empty - using fallback response');
      // Return helpful fallback instead of error message
      return "I can help you book museum tickets, view your bookings, or create a support ticket. What would you like to do?";
    }

    // Strict system rules for Gemini
    const systemContext = `You are a helpful museum ticketing assistant for Bengaluru museums.

CRITICAL RULES:
- Keep responses SHORT (1-2 lines maximum, max 100 words)
- Do NOT override or interfere with booking flows
- Do NOT hallucinate or invent museum names - only mention museums that actually exist in Bengaluru
- Do NOT proceed with bookings unless explicitly asked through proper booking flow
- Focus ONLY on museum ticket booking system context
- Be friendly, helpful, and concise
- If asked about museums, suggest they use the booking flow
- If asked about booking, direct them to say "book tickets"

Current session context: ${JSON.stringify(sessionContext)}

User: ${message}

Respond briefly and helpfully within the museum ticketing context only.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(systemContext);
    const response = await result.response;
    const text = response.text().trim();
    
    // Limit to 2 lines if longer
    const lines = text.split('\n').slice(0, 2);
    const finalResponse = lines.join('\n');
    
    // Enforce max length
    if (finalResponse.length > 200) {
      return finalResponse.substring(0, 197) + '...';
    }
    
    return finalResponse;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Never show configuration errors - always return helpful fallback
    if (error.errorDetails && error.errorDetails.some(detail => detail.reason === 'API_KEY_INVALID')) {
      console.error('❌ Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.');
      // Return helpful fallback instead of error
      return "I can help you book museum tickets, view your bookings, or create a support ticket. What would you like to do?";
    }
    
    // Generic error fallback - always helpful, never shows technical errors
    return "I can help you book museum tickets, view your bookings, or create a support ticket. What would you like to do?";
  }
};

// ============================================
// MAIN CHAT HANDLER
// ============================================

// @desc    Handle chat message
// @route   POST /api/chat
// @access  Public
export const handleChat = async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: 'Message and sessionId are required' });
    }

    // Get or create chat session
    let chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      chatSession = await ChatSession.create({
        sessionId,
        user: userId || null,
        messages: [],
        bookingContext: { step: null },
        supportTicketContext: { step: null },
      });
    }

    // Ensure bookingContext and supportTicketContext exist
    if (!chatSession.bookingContext) {
      chatSession.bookingContext = { step: null };
    }
    if (!chatSession.supportTicketContext) {
      chatSession.supportTicketContext = { step: null };
    }

    // Add user message
    chatSession.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date(),
    });

    let reply = '';
    let nextAction = null;
    let payload = null;

    // ============================================
    // RULE-BASED INTENT HANDLING (PRIORITY ORDER)
    // ============================================

    // 1. GREETING DETECTION (Rule-based, NO Gemini) - ALWAYS CHECK FIRST
    if (isGreeting(message)) {
      // Fixed response - always the same, never uses Gemini
      reply = "Hello! 👋 How can I assist you today? You can book museum tickets or create a support ticket.";
      nextAction = 'GREETING';
      // Reset any ongoing flows on greeting
      chatSession.bookingContext = { step: null };
      chatSession.supportTicketContext = { step: null };
    }
    // 2. CANCELLATION HANDLING
    else if (wantsCancel(message) && (chatSession.bookingContext?.step || chatSession.supportTicketContext?.step)) {
      if (chatSession.bookingContext?.step) {
        chatSession.bookingContext = { step: null };
        reply = "Booking cancelled. How else can I help you?";
      } else if (chatSession.supportTicketContext?.step) {
        chatSession.supportTicketContext = { step: null };
        reply = "Support ticket creation cancelled. How else can I help you?";
      }
      nextAction = null;
    }
    // 3. BOOKING FLOW (Rule-based, NO Gemini)
    else if (wantsBooking(message) || chatSession.bookingContext?.step) {
      const step = chatSession.bookingContext.step || 'start';

      // If user explicitly wants to book, reset and start fresh (including when in 'confirm' step)
      // Only continue existing flow if user is in the middle of selecting museum/date/tickets
      if (wantsBooking(message) && (step === null || step === 'start' || step === 'confirm')) {
        chatSession.bookingContext = { step: 'museum', mode: 'booking' };
        
        // Fetch and list all museums from MongoDB
        try {
          const museums = await Museum.find({ isActive: true }).limit(10);
          if (museums.length === 0) {
            reply = "Sure! Which museum would you like to visit? Currently, there are no museums available.";
            nextAction = 'ASK_MUSEUM';
          } else {
            let museumList = "Sure! Which museum would you like to visit? Here are the available museums:\n\n";
            museums.forEach((museum, index) => {
              museumList += `${index + 1}. ${museum.name} - ₹${museum.price}/ticket\n`;
            });
            museumList += "\nPlease select a museum by name or number.";
            reply = museumList;
            nextAction = 'ASK_MUSEUM';
          }
        } catch (error) {
          console.error('Error fetching museums:', error);
          reply = "Sure! Which museum would you like to visit? Here are the available museums:";
          nextAction = 'ASK_MUSEUM';
        }
      }
      // Continue booking flow based on current step
      else if (step === 'museum' || (wantsBooking(message) && step === 'start')) {
        // Try to match museum from message
        const museum = await getMuseumByName(message);
        if (museum) {
          chatSession.bookingContext.museumId = museum._id.toString();
          chatSession.bookingContext.museumName = museum.name;
          chatSession.bookingContext.step = 'date';
          chatSession.bookingContext.mode = 'booking';
          reply = `Great choice! ${museum.name}. What date would you like to visit?`;
          nextAction = 'ASK_DATE';
          payload = { museumId: museum._id.toString(), museumName: museum.name };
        } else {
          // Show museum list again if no match
          try {
            const museums = await Museum.find({ isActive: true }).limit(10);
            if (museums.length === 0) {
              reply = "I couldn't find that museum. Currently, there are no museums available.";
            } else {
              let museumList = "I couldn't find that museum. Here are the available museums:\n\n";
              museums.forEach((museum, index) => {
                museumList += `${index + 1}. ${museum.name} - ₹${museum.price}/ticket\n`;
              });
              reply = museumList;
            }
          } catch (error) {
            reply = "I couldn't find that museum. Please choose from the available museums.";
          }
          nextAction = 'ASK_MUSEUM';
        }
      }
      // DATE HANDLING
      else if (step === 'date') {
        // Check for go back first
        if (wantsGoBack(message)) {
          // Go back to museum selection
          chatSession.bookingContext.step = 'museum';
          chatSession.bookingContext.date = null;
          try {
            const museums = await Museum.find({ isActive: true }).limit(10);
            if (museums.length === 0) {
              reply = "Which museum would you like to visit? Currently, there are no museums available.";
            } else {
              let museumList = "Which museum would you like to visit? Here are the available museums:\n\n";
              museums.forEach((museum, index) => {
                museumList += `${index + 1}. ${museum.name} - ₹${museum.price}/ticket\n`;
              });
              museumList += "\nPlease select a museum by name or number.";
              reply = museumList;
            }
          } catch (error) {
            reply = "Which museum would you like to visit?";
          }
          nextAction = 'ASK_MUSEUM';
        } else {
          const parsedDate = parseDate(message);
          if (parsedDate && isValidFutureDate(parsedDate)) {
            chatSession.bookingContext.date = parsedDate;
            chatSession.bookingContext.step = 'tickets';
            reply = `Nice! ${parsedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. How many tickets do you need?`;
            nextAction = 'ASK_TICKETS';
            payload = {
              museumId: chatSession.bookingContext.museumId,
              museumName: chatSession.bookingContext.museumName,
              date: parsedDate.toISOString(),
              ticketCount: null,
              amount: null,
            };
          } else {
            reply = "Please provide a valid future date (e.g., YYYY-MM-DD, DD-MM-YYYY, or 'tomorrow').";
            nextAction = 'ASK_DATE';
          }
        }
      }
      // TICKET COUNT HANDLING
      else if (step === 'tickets') {
        // Check for go back first
        if (wantsGoBack(message)) {
          // Go back to date selection
          chatSession.bookingContext.step = 'date';
          chatSession.bookingContext.ticketCount = null;
          chatSession.bookingContext.amount = null;
          reply = `What date would you like to visit ${chatSession.bookingContext.museumName}?`;
          nextAction = 'ASK_DATE';
          payload = {
            museumId: chatSession.bookingContext.museumId,
            museumName: chatSession.bookingContext.museumName,
          };
        } else {
          const ticketCount = extractTicketCount(message);
          if (ticketCount && ticketCount > 0) {
            try {
              const museum = await Museum.findById(chatSession.bookingContext.museumId);
              if (!museum) {
                reply = "Museum not found. Please start over.";
                chatSession.bookingContext = { step: null };
                nextAction = null;
              } else {
                const totalAmount = ticketCount * museum.price;
                chatSession.bookingContext.ticketCount = ticketCount;
                chatSession.bookingContext.amount = totalAmount;
                chatSession.bookingContext.step = 'confirm';
                
                reply = `You are booking ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${chatSession.bookingContext.museumName}. Visit date: ${new Date(chatSession.bookingContext.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Total: ₹${totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Should I proceed to payment?`;
                nextAction = 'CONFIRM_BOOKING';
                payload = {
                  museumId: chatSession.bookingContext.museumId,
                  museumName: chatSession.bookingContext.museumName,
                  date: chatSession.bookingContext.date instanceof Date 
                    ? chatSession.bookingContext.date.toISOString() 
                    : chatSession.bookingContext.date,
                  ticketCount,
                  amount: totalAmount,
                };
              }
            } catch (error) {
              console.error('Error calculating booking:', error);
              reply = "Sorry, I encountered an error. Please try again.";
              nextAction = 'ASK_TICKETS';
            }
          } else {
            reply = "Please enter a valid number of tickets (1-100).";
            nextAction = 'ASK_TICKETS';
          }
        }
      }
      // CONFIRMATION HANDLING
      else if (step === 'confirm') {
        // Check for go back first
        if (wantsGoBack(message)) {
          // Go back to ticket count selection
          chatSession.bookingContext.step = 'tickets';
          chatSession.bookingContext.ticketCount = null;
          chatSession.bookingContext.amount = null;
          reply = `How many tickets do you need for ${chatSession.bookingContext.museumName}?`;
          nextAction = 'ASK_TICKETS';
          payload = {
            museumId: chatSession.bookingContext.museumId,
            museumName: chatSession.bookingContext.museumName,
            date: chatSession.bookingContext.date instanceof Date 
              ? chatSession.bookingContext.date.toISOString() 
              : chatSession.bookingContext.date,
          };
        } else if (isConfirmation(message)) {
          reply = "Redirecting to payment…";
          nextAction = 'TRIGGER_PAYMENT';
          payload = {
            museumId: chatSession.bookingContext.museumId,
            date: chatSession.bookingContext.date,
            ticketCount: chatSession.bookingContext.ticketCount,
            amount: chatSession.bookingContext.amount,
          };
          // Reset booking context after payment trigger
          chatSession.bookingContext = { step: null };
        } else if (wantsCancel(message)) {
          reply = "Booking cancelled. How else can I help you?";
          chatSession.bookingContext = { step: null };
          nextAction = null;
        } else {
          reply = "Please type 'yes' to proceed with payment, or 'cancel' to cancel the booking.";
          nextAction = 'CONFIRM_BOOKING';
        }
      }
      // Default for booking flow - shouldn't reach here often
      else {
        chatSession.bookingContext = { step: 'museum', mode: 'booking' };
        reply = "Which museum would you like to visit?";
        nextAction = 'ASK_MUSEUM';
      }
    }
    // 4. SUPPORT TICKET FLOW (Keep existing logic)
    else if (wantsSupportTicket(message) || chatSession.supportTicketContext?.step) {
      const step = chatSession.supportTicketContext.step || 'start';

      if (step === 'start' || step === null) {
        chatSession.supportTicketContext.step = 'name';
        reply = "I'll help you create a support ticket. What's your name?";
        nextAction = 'ASK_SUPPORT_NAME';
      } else if (step === 'name') {
        chatSession.supportTicketContext.name = message;
        chatSession.supportTicketContext.step = 'email';
        reply = `Thank you, ${message}. What's your email address?`;
        nextAction = 'ASK_SUPPORT_EMAIL';
      } else if (step === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(message)) {
          chatSession.supportTicketContext.email = message;
          chatSession.supportTicketContext.step = 'issueType';
          reply = "What type of issue is this? (e.g., Booking Issue, Payment Problem, General Inquiry)";
          nextAction = 'ASK_SUPPORT_ISSUE_TYPE';
        } else {
          reply = "Please provide a valid email address.";
          nextAction = 'ASK_SUPPORT_EMAIL';
        }
      } else if (step === 'issueType') {
        chatSession.supportTicketContext.issueType = message;
        chatSession.supportTicketContext.step = 'description';
        reply = "Please describe your issue in detail:";
        nextAction = 'ASK_SUPPORT_DESCRIPTION';
      } else if (step === 'description') {
        chatSession.supportTicketContext.description = message;
        chatSession.supportTicketContext.step = 'priority';
        reply = "What's the priority? (Low, Medium, High)";
        nextAction = 'ASK_SUPPORT_PRIORITY';
      } else if (step === 'priority') {
        const priority = message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
        if (['Low', 'Medium', 'High'].includes(priority)) {
          chatSession.supportTicketContext.priority = priority;

          let ticketId;
          let isUnique = false;
          while (!isUnique) {
            ticketId = generateTicketId();
            const existing = await SupportTicket.findOne({ ticketId });
            if (!existing) isUnique = true;
          }

          const supportTicket = await SupportTicket.create({
            user: userId || null,
            name: chatSession.supportTicketContext.name,
            email: chatSession.supportTicketContext.email,
            issueType: chatSession.supportTicketContext.issueType,
            description: chatSession.supportTicketContext.description,
            priority: chatSession.supportTicketContext.priority,
            ticketId,
          });

          await sendSupportTicketConfirmation(chatSession.supportTicketContext.email, {
            ticketId,
            name: chatSession.supportTicketContext.name,
            issueType: chatSession.supportTicketContext.issueType,
            description: chatSession.supportTicketContext.description,
          });

          reply = `Your support ticket has been created successfully! Your ticket ID is: ${ticketId}. We'll get back to you soon.`;
          nextAction = 'SUPPORT_TICKET_CREATED';
          payload = { ticketId };

          chatSession.supportTicketContext = { step: null };
        } else {
          reply = "Please choose Low, Medium, or High.";
          nextAction = 'ASK_SUPPORT_PRIORITY';
        }
      }
    }
    // 5. OTHER RULE-BASED INTENTS
    else if (wantsMyBookings(message)) {
      if (!userId) {
        reply = "Please login to view your bookings. Visit the dashboard after logging in.";
        nextAction = null;
      } else {
        try {
          const userBookings = await MuseumBooking.find({ user: userId })
            .populate('museum', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
          
          if (userBookings.length === 0) {
            reply = "You don't have any bookings yet. Would you like to book tickets?";
            nextAction = null;
          } else {
            let bookingList = `You have ${userBookings.length} booking(s):\n\n`;
            userBookings.forEach((booking, index) => {
              bookingList += `${index + 1}. ${booking.museum.name} - ${new Date(booking.date).toLocaleDateString('en-IN')} (${booking.ticketCount} tickets, ₹${booking.amount})\n`;
              bookingList += `   Booking ID: ${booking.bookingId}\n\n`;
            });
            bookingList += "Visit your dashboard to download tickets or view all bookings.";
            reply = bookingList;
            nextAction = 'SHOW_BOOKINGS';
          }
        } catch (error) {
          reply = "Sorry, I couldn't fetch your bookings right now. Please try again later.";
          nextAction = null;
        }
      }
    }
    else if (wantsDownloadTicket(message)) {
      if (!userId) {
        reply = "Please login to download your tickets.";
        nextAction = null;
      } else {
        try {
          const latestBooking = await MuseumBooking.findOne({ 
            user: userId,
            paymentStatus: 'paid',
            pdfUrl: { $ne: '' }
          })
            .populate('museum', 'name')
            .sort({ createdAt: -1 });
          
          if (latestBooking) {
            reply = `Your latest ticket for ${latestBooking.museum.name} is ready! Visit your dashboard or booking history to download the PDF. Booking ID: ${latestBooking.bookingId}`;
            nextAction = 'DOWNLOAD_TICKET';
            payload = { bookingId: latestBooking.bookingId, pdfUrl: latestBooking.pdfUrl };
          } else {
            reply = "No downloadable tickets found. Book tickets first or check if your payment is complete.";
            nextAction = null;
          }
        } catch (error) {
          reply = "Sorry, I couldn't find your tickets. Please try again later.";
          nextAction = null;
        }
      }
    }
    else if (wantsMuseumList(message)) {
      try {
        const museums = await Museum.find({ isActive: true }).limit(10);
        if (museums.length === 0) {
          reply = "No museums available at the moment.";
        } else {
          let museumList = "Available museums in Bengaluru:\n\n";
          museums.forEach((museum, index) => {
            museumList += `${index + 1}. ${museum.name} - ₹${museum.price}/ticket\n`;
          });
          museumList += "\nWould you like to book tickets for any of these?";
          reply = museumList;
        }
        nextAction = 'SHOW_MUSEUMS';
      } catch (error) {
        reply = "Sorry, I couldn't fetch the museum list. Please try again.";
        nextAction = null;
      }
    }
    else if (wantsHelp(message)) {
      reply = "I can help you:\n• Book museum tickets\n• View your bookings\n• Download tickets\n• Create support tickets\n• Answer questions\n\nWhat would you like to do?";
      nextAction = 'HELP';
    }
    // 6. GEMINI FALLBACK (ONLY when no rule applies)
    else {
      // Use Gemini with strict system rules
      const sessionContext = {
        bookingStep: chatSession.bookingContext?.step || null,
        hasActiveBooking: !!chatSession.bookingContext?.step,
      };
      reply = await getAIResponse(message, sessionContext);
      nextAction = 'AI_RESPONSE';
    }

    // Add bot reply
    chatSession.messages.push({
      sender: 'bot',
      text: reply,
      timestamp: new Date(),
    });

    await chatSession.save();

    res.json({
      success: true,
      data: {
        reply,
        nextAction,
        payload,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

