import React, { useState, useEffect } from 'react';
import { fetchStatistics } from '../api';
import '../styles/Statistics.css';

const Statistics = ({ month }) => {
  const [stats, setStats] = useState({ totalSales: 0, soldItems: 0, notSoldItems: 0 });

  useEffect(() => {
    const loadStatistics = async () => {
      const response = await fetchStatistics(month);
      setStats(response.data);
    };
    loadStatistics();
  }, [month]);

  return (
    <div>
      <h2>Statistics for {month}</h2>
      <p>Total Sales: ${stats.totalSales}</p>
      <p>Sold Items: {stats.soldItems}</p>
      <p>Unsold Items: {stats.notSoldItems}</p>
    </div>
  );
};

export default Statistics;
