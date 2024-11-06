const axios = require('axios');
const Transaction = require('../models/Transaction');

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

exports.getTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const monthNum = parseInt(month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }

  const startDate = new Date(new Date().getFullYear(), monthNum - 1, 1);
  const endDate = new Date(new Date().getFullYear(), monthNum, 0);

  const query = {
    $and: [
      { dateOfSale: { $gte: startDate, $lte: endDate } },
      {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } },
        ],
      },
    ],
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

exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  const monthNum = parseInt(month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }

  const startDate = new Date(new Date().getFullYear(), monthNum - 1, 1);
  const endDate = new Date(new Date().getFullYear(), monthNum, 0);

  try {
    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lte: endDate }, isSold: true } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const soldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lte: endDate }, isSold: true });
    const notSoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lte: endDate }, isSold: false });

    res.status(200).json({ totalSales: totalSales[0]?.total || 0, soldItems, notSoldItems });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
};

exports.getBarChartData = async (req, res) => {
  const { month } = req.query;
  const monthNum = parseInt(month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }

  const startDate = new Date(new Date().getFullYear(), monthNum - 1, 1);
  const endDate = new Date(new Date().getFullYear(), monthNum, 0);

  try {
    const priceRanges = [
      { range: "0-100", count: await Transaction.countDocuments({ price: { $gte: 0, $lte: 100 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "101-200", count: await Transaction.countDocuments({ price: { $gt: 100, $lte: 200 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "201-300", count: await Transaction.countDocuments({ price: { $gt: 200, $lte: 300 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "301-400", count: await Transaction.countDocuments({ price: { $gt: 300, $lte: 400 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "401-500", count: await Transaction.countDocuments({ price: { $gt: 400, $lte: 500 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "501-600", count: await Transaction.countDocuments({ price: { $gt: 500, $lte: 600 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "601-700", count: await Transaction.countDocuments({ price: { $gt: 600, $lte: 700 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "701-800", count: await Transaction.countDocuments({ price: { $gt: 700, $lte: 800 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "801-900", count: await Transaction.countDocuments({ price: { $gt: 800, $lte: 900 }, dateOfSale: { $gte: startDate, $lte: endDate } }) },
      { range: "901-above", count: await Transaction.countDocuments({ price: { $gt: 900 }, dateOfSale: { $gte: startDate, $lte: endDate } }) }
    ];
    res.status(200).json(priceRanges);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ error: 'Error fetching bar chart data' });
  }
};

exports.getPieChartData = async (req, res) => {
  const { month } = req.query;
  const monthNum = parseInt(month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }

  const startDate = new Date(new Date().getFullYear(), monthNum - 1, 1);
  const endDate = new Date(new Date().getFullYear(), monthNum, 0);

  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ error: 'Error fetching pie chart data' });
  }
};

exports.getCombinedData = async (req, res) => {
  const { month } = req.query;

  try {
    const transactions = await exports.getTransactions(req, res);
    const statistics = await exports.getStatistics(req, res);
    const barChartData = await exports.getBarChartData(req, res);
    const pieChartData = await exports.getPieChartData(req, res);

    res.status(200).json({
      transactions,
      statistics,
      barChartData,
      pieChartData
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Error fetching combined data' });
  }
};
