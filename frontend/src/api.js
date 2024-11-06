import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

export const fetchTransactions = (page, search, month) =>
  api.get('/transactions', { params: { page, search, month } });

export const fetchStatistics = (month) => api.get('/statistics', { params: { month } });

export const fetchBarChartData = (month) => api.get('/bar-chart', { params: { month } });

export const fetchPieChartData = (month) => api.get('/pie-chart', { params: { month } });

export default api;
