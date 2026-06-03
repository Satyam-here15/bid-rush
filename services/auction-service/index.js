// ============================================================
// index.js — Starts the Auction Service
// Follows the EXACT same structure as Member 1's auth-service/index.js
// ============================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const auctionRoutes = require('./routes/auction.routes')

const app = express()

app.use(cors({
  origin: ["https://bid-rush.netlify.app", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json())

// Health check — open http://localhost:5002/ to confirm it's running
app.get('/', (req, res) => {
  res.json({ message: 'Auction Service running' })
})
app.use((req, res, next) => {
  console.log('Auction service received:', req.method, req.path)
  next()
})

app.use('/', auctionRoutes)
// Routes — mounted at root because gateway already has /api/auctions
app.use('/', auctionRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => {
      console.log(`Auction Service running on port ${process.env.PORT}`)
    })
    // Start cron jobs after DB connects
     require('./jobs/auctionClose.job')
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error)
  })
