# Admin Panel - Discord Server Monitor

Beautiful admin panel for managing users, subscriptions, and platform settings.

## Features

- 🔐 Secure admin authentication
- 👥 View all users with search functionality
- ✏️ Edit user subscriptions and expiry dates
- 📊 Dashboard with statistics
- 🎨 Beautiful, modern UI design
- 📱 View user device tokens

## Setup

1. **Install dependencies:**
   ```bash
   cd website
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - `MONGO_URI` - Your MongoDB connection string (same as discord-bot)
   - `SESSION_SECRET` - A random secret key for sessions

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the admin panel:**
   - Open: http://localhost:3000
   - Register at: http://localhost:3000/register
   - Login at: http://localhost:3000/login

## Admin Registration

**First-time setup:**
1. Navigate to `/register`
2. Enter your phone number (with country code, e.g., +1234567890)
3. Set a secure password (minimum 8 characters)
4. Optionally add an email address

**Security:**
- Passwords are hashed with both **bcrypt** and **argon2** for maximum security
- Phone number is used as the unique identifier
- Session-based authentication

⚠️ **No default admin account - you must register first!**

## Features

### Dashboard
- View all users in a beautiful table
- Search users by email
- Statistics cards showing:
  - Total users
  - Subscribed users
  - Pro/Basic tier breakdown

### User Management
- Edit user email
- Change subscription tier (None/Basic/Pro)
- Set subscription status (Active/Inactive)
- Set/remove expiry dates
- View device tokens (Expo & FCM)

## Security

- Session-based authentication
- **Dual password hashing**: Both bcrypt AND argon2 for maximum security
- Protected routes (requires login)
- Phone number-based authentication

## Project Structure

```
website/
├── config/
│   └── database.js          # MongoDB connection (uses MONGO_URI from .env)
├── controllers/
│   ├── authController.js    # Login/Register logic
│   ├── dashboardController.js # Dashboard & stats
│   └── userController.js    # User management
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── Admin.js             # Admin model (admins collection)
│   └── AppUser.js           # App user model (app_users collection)
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── dashboardRoutes.js  # Dashboard routes
│   └── userRoutes.js       # User routes
├── utils/
│   └── password.js          # Password hashing (bcrypt + argon2)
├── views/                   # EJS templates
├── public/                  # Static files (CSS)
└── server.js                # Main server file
```

## Database Connection

The website uses the **same MongoDB connection** as the Flask backend:
- **Environment Variable:** `MONGO_URI` (in `.env` file)
- **Database Name:** `CollaborativeSuccess`
- **Collections Used:**
  - `app_users` - App users (read/write)
  - `admins` - Admin accounts (read/write)
  - `discord_links` - Discord account links (read-only)
  - `expert_moves` - Expert moves (read-only)
  - `payments` - Payment records (read-only)

## Tech Stack

- **Backend:** Node.js + Express
- **View Engine:** EJS
- **Database:** MongoDB (same as Flask backend)
- **Password Hashing:** bcrypt + argon2 (dual hashing)
- **Styling:** Custom CSS with modern design

