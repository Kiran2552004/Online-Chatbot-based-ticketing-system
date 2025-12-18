import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bookingContext: {
    museumId: String,
    museumName: String,
    date: Date,
    ticketCount: Number,
    amount: Number,
    step: String, // 'museum', 'date', 'tickets', 'confirm'
  },
  supportTicketContext: {
    step: String, // 'name', 'email', 'issueType', 'description', 'priority'
    name: String,
    email: String,
    issueType: String,
    description: String,
    priority: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

chatSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;

