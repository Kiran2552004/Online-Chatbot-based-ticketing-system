# Bengaluru Museum Ticketing System

A full-stack AI-powered museum ticketing system with chatbot integration, built for Bengaluru museums.

## Features

- 🎫 **User Authentication** - Secure login/register with JWT
- 🤖 **AI Chatbot** - Gemini-powered chatbot for bookings and support
- 💳 **Stripe Payments** - Secure payment processing (test mode)
- 📧 **Email Confirmations** - Automated booking and ticket confirmations
- 👨‍💼 **Admin Dashboard** - Manage museums, bookings, tickets, and users
- 📱 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Stripe (Test Mode)
- Google Gemini AI
- Nodemailer

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- Axios
- Context API

## Project Structure

```
.
├── server/              # Backend
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Express server
├── client/             # Frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── App.jsx     # Main app component
│   └── ...
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for email service)
- Stripe account (test keys)
- Google Gemini API key

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection_string
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
CLIENT_URL=http://localhost:5173
```

4. Seed museums (optional):
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `client/` directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Museums
- `GET /api/museums` - Get all active museums
- `GET /api/museums/:id` - Get single museum

### Bookings
- `GET /api/bookings` - Get user's bookings (protected)
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/:id` - Get single booking (protected)

### Chat
- `POST /api/chat` - Send chat message

### Payment
- `POST /api/payment/create-checkout-session` - Create Stripe checkout (protected)
- `POST /api/payment/verify-payment` - Verify payment (protected)

### Support Tickets
- `GET /api/support-tickets` - Get user's tickets (protected)
- `GET /api/support-tickets/:id` - Get single ticket (protected)

### Admin
- `GET /api/admin/bookings` - Get all bookings (admin)
- `GET /api/admin/tickets` - Get all tickets (admin)
- `PUT /api/admin/tickets/:id` - Update ticket status (admin)
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/museums` - Get all museums (admin)
- `POST /api/admin/museums` - Create museum (admin)
- `PUT /api/admin/museums/:id` - Update museum (admin)
- `DELETE /api/admin/museums/:id` - Delete museum (admin)

## Usage

1. **Register/Login** - Create an account or login
2. **Chat with AI** - Click "Chat with Support" to start booking tickets or create support tickets
3. **Book Tickets** - Use the chatbot to:
   - Select a museum
   - Choose a date
   - Select number of tickets
   - Complete payment via Stripe
4. **View Dashboard** - See your bookings and support tickets
5. **Admin Access** - Login as admin to manage the system

## Creating Admin User

To create an admin user, you can either:
1. Manually update the user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or create via MongoDB Compass/Atlas UI.

## Environment Variables

Make sure all environment variables are set correctly:
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **MONGO_URI**: MongoDB Atlas connection string
- **STRIPE_KEYS**: Test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- **JWT_SECRET**: Any random string for JWT signing
- **EMAIL_USER/PASS**: Gmail address and app password (enable 2FA and generate app password)

## Notes

- This is a test/demo application - Stripe is in test mode
- Email service requires Gmail app password (not regular password)
- Chatbot uses hybrid rule-based + AI approach for better UX
- All sensitive operations require authentication
- Admin routes require admin role

## License

MIT

