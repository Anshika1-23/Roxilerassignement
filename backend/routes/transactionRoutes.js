// backend/routes/transactionRoutes.js
const express = require('express');
const {
  seedDatabase,
  getTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/initialize', seedDatabase);
router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChartData);
router.get('/pie-chart', getPieChartData);

module.exports = router;
