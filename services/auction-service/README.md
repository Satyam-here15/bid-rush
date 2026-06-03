# 🏷️ Bid-Rush — Auction Service (Member 2 Guide)

## What This Service Does
This is the **Auction Service** — it runs on **port 5002** and manages everything related to auctions:
- Creating, editing, deleting auctions
- Listing auctions with filters (by status, category)
- Auto-closing auctions when their end time arrives (via node-cron)

---

## 📁 Folder Structure (All Files You Have)

```
auction-service/
├── index.js                        ← Starts the server, connects to MongoDB
├── package.json                    ← Lists all npm packages to install
├── .env.example                    ← Template for your .env file
├── .gitignore                      ← Stops .env and node_modules from being pushed
│
├── models/
│   └── auction.model.js            ← Defines what an auction looks like in MongoDB
│
├── controllers/
│   └── auction.controller.js       ← All the actual business logic (the real code)
│
├── routes/
│   └── auction.routes.js           ← Maps URLs to controller functions
│
├── middleware/
│   └── auth.middleware.js          ← JWT checker (from Member 1)
│
└── jobs/
    └── auctionClose.job.js         ← Auto-closes expired auctions every minute
```

---

## 🚀 Step-by-Step Setup (Do This Once)

### Step 1 — Clone the GitHub Repo
```bash
git clone https://github.com/lakshaybhardwaj18/bid-rush.git
cd bid-rush
```

### Step 2 — Go into your service folder and copy these files there
```bash
cd services/auction-service
```
Copy all the files from this folder into `services/auction-service/`

### Step 3 — Install packages
```bash
npm install
```
This reads package.json and downloads all the packages. You'll see a `node_modules` folder appear.

### Step 4 — Create your .env file
- Copy `.env.example` and rename it to `.env`
- The file already has the correct MongoDB URI from Member 1
- It should look like this:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
PORT=5002
JWT_SECRET=bidrush_super_secret_key_2024
INTERNAL_SECRET=bidrush_internal_secret_789
```

### Step 5 — Install nodemon (for auto-restart during development)
```bash
npm install -g nodemon
```

### Step 6 — Run the service
```bash
npm run dev
```

### Step 7 — Test it's working
Open your browser and go to: **http://localhost:5002/health**

You should see:
```json
{ "status": "Auction Service Running", "port": 5002 }
```

✅ If you see that — your service is running perfectly!

---

## 🔌 API Endpoints — What Your Service Exposes

| Method | URL | Login Required? | Description |
|--------|-----|-----------------|-------------|
| GET | `/auctions` | No | Get all auctions |
| GET | `/auctions?status=active` | No | Filter by status |
| GET | `/auctions?category=Electronics` | No | Filter by category |
| GET | `/auctions/:id` | No | Get one auction |
| GET | `/auctions/my` | ✅ Yes | Get my created auctions |
| POST | `/auctions` | ✅ Yes | Create new auction |
| PUT | `/auctions/:id` | ✅ Yes | Update auction |
| DELETE | `/auctions/:id` | ✅ Yes | Delete auction |
| PUT | `/auctions/:id/bid` | 🔒 Internal | Update bid (Bid Service only) |

---

## 📋 How to Create an Auction (Test with Postman)

**POST** `http://localhost:5002/auctions`

Headers:
```
Authorization: Bearer <JWT token from login>
Content-Type: application/json
```

Body (JSON):
```json
{
  "title": "iPhone 15 Pro Max",
  "description": "Brand new, unopened, 256GB Space Black",
  "category": "Electronics",
  "startPrice": 50000,
  "startTime": "2025-03-05T10:00:00Z",
  "endTime": "2025-03-07T10:00:00Z"
}
```

---

## ⏰ The Cron Job (Auto-Close Auctions)

The `auctionClose.job.js` runs **every minute** in the background:
1. Finds all auctions with `status: "active"` and `endTime` in the past
2. Changes their `status` to `"ended"` and sets `winner` = last highest bidder
3. Finds all auctions with `status: "upcoming"` and `startTime` in the past
4. Changes their `status` to `"active"`

You can see it working in your terminal logs:
```
⏰ Auction cron jobs scheduled (running every minute)
⏰ Cron job: Found 1 expired auction(s). Closing them...
  ✅ Closed auction: "iPhone 15 Pro Max" | Winner: 64abc...
```

---

## 📢 What to Share With Your Team

After your service is running, tell your teammates in WhatsApp:

```
✅ Auction Service done! Running on port 5002
INTERNAL_SECRET=bidrush_internal_secret_789
(Member 3 needs this to call the /bid endpoint)

Available endpoints:
GET  http://localhost:5002/auctions
GET  http://localhost:5002/auctions/:id
POST http://localhost:5002/auctions  (needs JWT)
```

---

## 🔗 How Other Services Use Your Service

**Frontend (Member 5)** calls your GET endpoints to show auctions:
```js
const res = await axios.get('http://localhost:5000/api/auctions')  // via Gateway
```

**Bid Service (Member 3)** calls your internal endpoint when a bid is placed:
```js
await axios.put(`http://localhost:5002/auctions/${auctionId}/bid`, {
  currentBid: 55000,
  currentBidder: 'user123'
}, {
  headers: { 'x-internal-secret': 'bidrush_internal_secret_789' }
})
```

---

## ❓ Common Issues

**"MongoDB connection failed"**
→ Check your .env file has the correct MONGO_URI

**"Cannot find module"**
→ Run `npm install` again

**"Port already in use"**
→ Something else is using port 5002. Kill it: `npx kill-port 5002`

**"Invalid token"**
→ Make sure JWT_SECRET in your .env matches Member 1's JWT_SECRET exactly
