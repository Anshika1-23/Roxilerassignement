// src/components/TransactionTable.js
import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '../api';
import '../styles/TransactionTable.css';


const TransactionTable = ({ month }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const loadTransactions = async () => {
    const response = await fetchTransactions(page, search, month);
    setTransactions(response.data);
  };

  useEffect(() => { loadTransactions(); }, [page, search, month]);

  return (
    <div>
      <h2>Transactions</h2>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table>
        <thead>
          <tr><th>Title</th><th>Description</th><th>Price</th></tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setPage(page > 1 ? page - 1 : 1)}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
};

export default TransactionTable;
