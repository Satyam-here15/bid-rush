const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ override: false })

const bidRoutes = require('./src/routes/bid.routes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({
  origin: ["https://bid-rush.netlify.app", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json());

app.use('/api/bids', bidRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'bid-service', status: 'running', port: PORT });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Bid Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection failed:', err.message);
    process.exit(1);
  });