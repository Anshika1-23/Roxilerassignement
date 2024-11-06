// controllers/transactionController.js
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Seed Database from Third-Party API
exports.seedDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
};

// List Transactions with Search and Pagination
exports.getTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  // Ensure month is a valid number
  const monthNum = parseInt(month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }

  // Create start and end dates for the month
  const startDate = new Date(new Date().getFullYear(), monthNum - 1, 1); // Start of the month
  const endDate = new Date(new Date().getFullYear(), monthNum, 1); // Start of the next month

  const query = {
    $and: [
      { $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } }
        ] 
      },
      { dateOfSale: { $regex: `-${month}-` } }
    ]
  };

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

// Get Statistics for a Specific Month
exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  try {
    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: `-${month}-` }, isSold: true } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const soldItems = await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, isSold: true });
    const notSoldItems = await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, isSold: false });

    res.status(200).json({ totalSales: totalSales[0]?.total || 0, soldItems, notSoldItems });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
};

// Get Bar Chart Data (Price Range Counts)
exports.getBarChartData = async (req, res) => {
  const { month } = req.query;
  try {
    const priceRanges = [
      { range: "0-100", count: await Transaction.countDocuments({ price: { $gte: 0, $lte: 100 }, dateOfSale: { $regex: `-${month}-` } }) },
      // ... repeat for other ranges
      { range: "901-above", count: await Transaction.countDocuments({ price: { $gt: 900 }, dateOfSale: { $regex: `-${month}-` } }) }
    ];
    res.status(200).json(priceRanges);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ error: 'Error fetching bar chart data' });
  }
};

// Get Pie Chart Data (Category Counts)
exports.getPieChartData = async (req, res) => {
  const { month } = req.query;
  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: `-${month}-` } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ error: 'Error fetching pie chart data' });
  }
};
