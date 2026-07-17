# Bengaluru Museum Ticketing System

A full-stack AI-powered museum ticketing system with chatbot integration, built for Bengaluru museums. This platform allows visitors to natively purchase museum tickets using a smart AI assistant, securely complete payments via Stripe, and automatically receive PDF e-tickets via email.

---

## 🚀 Features

- 🎫 **User Authentication** - Secure Login/Register flows with JWT.
- 🤖 **AI Chatbot Assistant** - **Google Gemini-powered** conversational bot that handles booking tickets, answering queries, and creating support tickets.
- 💳 **Stripe Payments** - Fully integrated secure payment processing via Stripe checkout (currently in Test Mode).
- 📧 **Automated Email & E-Tickets** - Emails sent via Nodemailer with **automated PDF Ticket generation** (complete with QR codes via `pdfkit` & `qrcode`).
- 👨‍💼 **Admin Dashboard** - Role-based dashboard allowing an admin to manage available museums, view all bookings, handle support tickets, and oversee users.
- 📱 **Modern Animated UI** - Responsive and stunning frontend built using **React 18**, **Tailwind CSS**, and **Framer Motion** for sleek micro-interactions and transitions.
- 🛡️ **Race-Condition Protection** - Hardened backend and optimized frontend to handle React 18 Strict Mode and prevent double processing of purchases and duplicate emails.

---

## 🛠 Tech Stack

### Backend
- **Node.js + Express** - RESTful API server architecture
- **MongoDB + Mongoose** - NoSQL database & ODM
- **JWT (JSON Web Tokens)** - Stateless authentication & authorization
- **Stripe API** - Payment Gateway (Test Mode)
- **Google Gemini API** (`@google/generative-ai`) - Integrated Chatbot logic
- **Nodemailer** - SMTP email service integration
- **PDFKit & QRCode** - Real-time custom PDF ticket rendering

### Frontend
- **React 18 + Vite** - Fast and optimized UI rendering
- **React Router Dom (v6)** - Client-side routing
- **Tailwind CSS** - Utility-first styling with custom themes
- **Framer Motion** - Animation library for enter/exit animations and micro-interactions
- **Axios** - Flexible Promise-based HTTP client
- **Context API** - State management for Authentication

---

## 📁 Project Structure

```
.
├── server/               # Backend Environment
│   ├── config/           # Database config & initialization
│   ├── controllers/      # API logic (auth, chat, bookings, payments, etc.)
│   ├── middleware/       # Custom middleware (JWT auth protection, admin checks)
│   ├── models/           # Mongoose schemas (User, Booking, Museum, ChatSession)
│   ├── routes/           # Express routes mapping API to controllers
│   ├── utils/            # Helpers (PDF generation, Email services, generate IDs)
│   └── server.js         # Main Express App entry point
│
├── client/               # Frontend Environment
│   ├── src/
│   │   ├── components/   # Reusable UI components & Animations (Framer Motion)
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Views (Dashboard, Chatbot, Admin Panel, Auth pages)
│   │   ├── services/     # API helpers (Axios interceptors)
│   │   └── App.jsx       # Root App with Routes
│   └── ...
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Base](https://www.mongodb.com/atlas) (Atlas Account or local instance)
- Gmail account (For Nodemailer App Password service)
- Stripe Account ([Get Test Keys](https://dashboard.stripe.com/test/apikeys))
- Google Gemini API key ([Get Here](https://aistudio.google.com/app/apikey))

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server/` directory:
   ```env
   # API Keys
   GEMINI_API_KEY=your_gemini_api_key
   
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # Stripe Validation Integration
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   
   # Security
   JWT_SECRET=your_super_secret_jwt_string
   
   # Nodemailer / Email config
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Ports
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
   *Note: For `EMAIL_PASS`, you must generate an "App Password" from your Google Account settings, rather than using your login password.*

4. Seed initial museum data (Optional but recommended):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on: `http://localhost:5000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `client/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will run on: `http://localhost:5173`*

---

## 🔐 Creating an Admin User

To access Admin features, you need a user with the `admin` role. You can either:

**1. Use the provided backend script:**
Navigate to your `server` directory and run:
```bash
npm run create-admin
```

**2. Manually via MongoDB Compass / Mongosh:**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🔌 Core API Endpoints

### User & Auth
- **`POST`** `/api/auth/register` - Register a new user
- **`POST`** `/api/auth/login` - Login user
- **`GET`** `/api/auth/me` - Get current user profile *(Protected)*

### Booking & Payment Flow
- **`GET`** `/api/museums` - Fetch all museum data
- **`POST`** `/api/bookings` - Create a pending ticket booking *(Protected)*
- **`POST`** `/api/payment/create-checkout-session` - Generates a Stripe Session URL *(Protected)*
- **`POST`** `/api/payment/verify-payment` - Atomic verifier to update booking status & send ticket PDF *(Protected)*

### Support & Chat
- **`POST`** `/api/chat` - Interact with the Google Gemini powered Assistant
- **`GET`** `/api/support-tickets` - Retrieve user-specific support complaints *(Protected)*

### Admin Role Exclusive *(Protected & Role=Admin)*
- **`GET`** `/api/admin/bookings` - See global transactions platform-wide.
- **`GET/PUT`** `/api/admin/tickets` - Oversee and update user support ticket statuses.

---

## 💡 Usage Guide

1. **Sign Up/Login**: Create an account via the visually dynamic frontend.
2. **Interact with AI**: Click the floating chatbot avatar `🤖` natively nested in the app layout.
3. **Book your Experience**:
   - Instruct the bot that you want to book tickets.
   - Using AI prompts, select the Museum, Date *(post-tomorrow exclusively)*, and Quantity.
   - Click "Pay with Stripe" inside the chat UI to be instantly redirected to the payment gateway.
4. **Download Ticket**: After a successful Stripe payment, wait for the **double-email protected verification**. The API generates a PDF layout of your invoice with QR Codes and sends it directly to your inbox.
5. **Dashboard Access**: Track all historical purchases and support tickets cleanly from the generic Dashboard overview.

---
