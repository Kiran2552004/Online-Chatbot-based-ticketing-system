# Quick Start Guide

## Prerequisites Check

✅ Node.js (v16+) installed  
✅ MongoDB Atlas account  
✅ Gmail account (for email service)  
✅ Stripe test account  
✅ Google Gemini API key  

## Step 1: Backend Setup

```bash
cd server
npm install
```

Create `server/.env` file with your credentials:
```env
GEMINI_API_KEY=your_key_here
MONGO_URI=your_mongodb_connection_string
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=supersecretkey123
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
CLIENT_URL=http://localhost:5173
```

Seed museums:
```bash
npm run seed
```

Start server:
```bash
npm run dev
```

Backend should run on `http://localhost:5000`

## Step 2: Frontend Setup

Open a new terminal:
```bash
cd client
npm install
```

Start frontend:
```bash
npm run dev
```

Frontend should run on `http://localhost:5173`

## Step 3: Create Admin User

1. Register a regular user through the UI
2. In MongoDB Atlas, find the user and change `role` from `"user"` to `"admin"`

Or via MongoDB shell:
```javascript
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Step 4: Test the Application

1. Visit `http://localhost:5173`
2. Register a new user
3. Click "Chat with Support"
4. Try booking a ticket: Say "I want to book tickets"
5. Follow the chatbot flow
6. Complete payment (use Stripe test card: 4242 4242 4242 4242)
7. Check your dashboard for the booking

## Common Issues

### MongoDB Connection Error
- Check your MONGO_URI in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas

### Email Not Sending
- Enable 2FA on your Gmail account
- Generate an App Password (not your regular password)
- Use the app password in `EMAIL_PASS`

### Stripe Payment Fails
- Ensure you're using test mode keys
- Use test card: 4242 4242 4242 4242
- Any future expiry date and any CVC

### Chatbot Not Responding
- Check GEMINI_API_KEY is set correctly
- Verify API key is active in Google AI Studio

## Next Steps

- Customize museum data in `server/utils/seedMuseums.js`
- Update email templates in `server/utils/emailService.js`
- Customize UI colors in `client/tailwind.config.js`
- Add more museums through admin dashboard


