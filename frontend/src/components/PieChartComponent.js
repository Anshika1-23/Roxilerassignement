import React, { useState, useEffect } from 'react';
import { fetchPieChartData } from '../api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/PieChartComponent.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PieChartComponent = ({ month }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadPieData = async () => {
      const response = await fetchPieChartData(month);
      setData(response.data.map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] })));
    };
    loadPieData();
  }, [month]);

  return (
    <div>
      <h2>Category Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
