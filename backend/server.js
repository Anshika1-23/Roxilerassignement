// server.js
const express = require('express');
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
