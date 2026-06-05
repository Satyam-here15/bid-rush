const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config({ override: false })

const app = express()

app.use(cors({
  origin: ["https://bid-rush.netlify.app", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json())

app.use((req, res, next) => {
  console.log('Gateway received:', req.method, req.originalUrl)
  next()
})

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway running' })
})

// Auth Service — strips /api/auth before forwarding
app.use('/api/auth', async (req, res) => {
  try {
    const strippedPath = req.originalUrl.replace('/api/auth', '')
    const url = `https://bidrush-auth.onrender.com${strippedPath}`
    console.log('Forwarding to:', url)
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization })
      }
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Gateway error' })
  }
})

// Auction Service — keeps /api/auctions
app.use('/api/auctions', async (req, res) => {
  try {
    const url = `https://bidrush-auction.onrender.com${req.originalUrl}`
    console.log('Forwarding to:', url)
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization }),
        ...(req.headers['x-admin-secret'] && { 'x-admin-secret': req.headers['x-admin-secret'] }),
        ...(req.headers['x-internal-secret'] && { 'x-internal-secret': req.headers['x-internal-secret'] }),
      }
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Gateway error' })
  }
})

// Bid Service — keeps /api/bids
app.use('/api/bids', async (req, res) => {
  try {
    const url = `https://bidrush-bid.onrender.com${req.originalUrl}`
    console.log('Forwarding to:', url)
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization })
      }
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Gateway error' })
  }
})

// Notification Service — keeps /api/notifications
app.use('/api/notifications', async (req, res) => {
  try {
    const url = `https://bidrush-notification.onrender.com${req.originalUrl}`
    console.log('Forwarding to:', url)
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization })
      }
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Gateway error' })
  }
})

app.listen(5000, () => {
  console.log('API Gateway running on port 5000')
})