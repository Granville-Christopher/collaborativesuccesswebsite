# Database Connection Information

## Where the Website Looks for MongoDB Connection

The website uses the **same MongoDB connection string** as your Flask backend (`discord-bot/app.py`).

### Connection String Location

**Environment Variable:** `MONGO_URI`

**File:** `.env` (in the `website/` folder)

**Code Location:** `website/config/database.js`

```javascript
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
```

### Database Configuration

- **Database Name:** `CollaborativeSuccess` (same as Flask backend)
- **Connection:** Uses Mongoose to connect to MongoDB
- **Collections Used:**
  - `app_users` - Main user collection (read/write)
  - `admins` - Admin accounts (read/write)
  - `discord_links` - Discord account links (read-only)
  - `expert_moves` - Expert moves (read-only)
  - `payments` - Payment records (read-only)

### Setup Steps

1. Copy your `MONGO_URI` from `discord-bot/.env` (or Railway/environment variables)
2. Create `website/.env` file:
   ```
   MONGO_URI=your-mongodb-connection-string-here
   SESSION_SECRET=your-random-secret-key
   PORT=3000
   ```
3. The website will automatically connect to the same database as your Flask backend

### Verification

When the server starts, you should see:
```
✅ Connected to MongoDB
   Database: CollaborativeSuccess
   Collections: app_users, discord_links, expert_moves, payments
```

If you see an error, check:
- `MONGO_URI` is set in `website/.env`
- The connection string is valid
- MongoDB is accessible from your server

