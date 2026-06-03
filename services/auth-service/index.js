const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')

const app = express()

app.use(cors({
  origin: ["https://bid-rush.netlify.app", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Auth Service running' })
})

// Routes — mounted at root because gateway already has /api/auth
app.use('/', authRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => {
      console.log(`Auth Service running on port ${process.env.PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error)
  })