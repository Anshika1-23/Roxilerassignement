import React, { useState } from 'react';
import TransactionTable from './components/TransactionTable';
import Statistics from './components/Statistics';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';
import './App.css';

const App = () => {
  const [month, setMonth] = useState('March');

  return (
    <div className="App">
      <h1>Transaction Dashboard</h1>
      <label>Select Month: </label>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <Statistics month={month} />
      <TransactionTable month={month} />
      <BarChartComponent month={month} />
      <PieChartComponent month={month} />
    </div>
  );
};

export default App;
