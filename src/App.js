import './App.scss';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // State variables for managing data and user input
  const [search, setSearch] = useState(''); // Search input
  const [crypto, setCrypto] = useState([]); // Full crypto data
  const [numericData, setNumericData] = useState([]); // Separate state for numeric data
  const [selectedDataRange, setSelectedDataRange] = useState(''); // Data range input
  const [filteredCrypto, setFilteredCrypto] = useState([]); // Filtered cryptocurrency data
  const [errorMessage, setErrorMessage] = useState(''); // Error message for data fetching

  const MAX_SEARCH_LENGTH = 30; // Maximum character limit for search input

  useEffect(() => {
    // Function to fetch cryptocurrency data from an API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.coinstats.app/public/v1/coins',
          {
            params: {
              skip: 0,
              limit: 100,
              currency: 'eur', // Change currency to EUR
            },
          }
        );

        // Set the full cryptocurrency data
        setCrypto(response.data.coins);
        
        // Apply search and data range filtering
        let filtered = response.data.coins;

        if (search) {
          filtered = filtered.filter((val) =>
            val.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (!isNaN(selectedDataRange) && selectedDataRange > 0) {
          filtered = filtered.slice(0, selectedDataRange);
        }

        // Set the filtered cryptocurrency data
        setFilteredCrypto(filtered);

        // Extract numeric data for refreshing
        const numericData = response.data.coins.map((coin) => ({
          marketCap: coin.marketCap.toFixed(2),
          price: coin.price.toFixed(2),
        }));

        // Set the numeric data for refreshing
        setNumericData(numericData);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setErrorMessage('Failed to fetch data. Please try again later.');
      }
    };

    // Initial data fetch
    fetchData();

    // Refresh data every 3 seconds
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 3000);

    // Clean up interval when component unmounts
    return () => {
      clearInterval(refreshInterval);
    };
  }, [search, selectedDataRange]); // Include search and selectedDataRange as dependencies

  const handleSearchChange = (e) => {
    const inputText = e.target.value;

    // Check character limit validation
    if (inputText.length > MAX_SEARCH_LENGTH) {
      setErrorMessage('Search input exceeds 30 characters.');
    } else {
      setErrorMessage('');
    }

    // Log the search input to the console
    console.log('Search Input:', inputText);

    // Update the search input state
    setSearch(inputText);
  };

  const handleDataRangeChange = (e) => {
    const selectedRange = parseInt(e.target.value);

    // Update the data range input state
    setSelectedDataRange(selectedRange);
  };

  return (
    <div className="App">
      <h1>All Cryptocurrencies</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="search-container">
        <label htmlFor="cryptoSelect">Search by Name:</label>
        <div className="input-select">
          <select
            id="cryptoSelect"
            className="form-select"
            value={search}
            onChange={handleSearchChange}
          >
            <option value="">Select a cryptocurrency</option>
            {crypto.map((val, id) => (
              <option key={id} value={val.name}>
                {val.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className={`form-control ${errorMessage ? 'error-input' : ''}`}
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            maxLength={MAX_SEARCH_LENGTH}
          />
        </div>
      </div>
      <div className="data-range-container">
        <label htmlFor="dataRange">Data Range (Number of Currencies):</label>
        <input
          type="number"
          id="dataRange"
          className="form-control"
          placeholder="Enter a number..."
          value={selectedDataRange}
          onChange={handleDataRangeChange}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
            <th scope="col">Symbol</th>
            <th scope="col">Market Cap (EUR)</th>
            <th scope="col">Price (EUR)</th>
          </tr>
        </thead>
        <tbody>
          {filteredCrypto.map((val, id) => {
            return (
              <tr key={id}>
                <td className="rank">{val.rank}</td>
                <td className="logo">
                  <a href={val.id}>
                    <img src={val.icon} alt="logo" width="30px" />
                  </a>
                  <p>{val.name}</p>
                </td>
                <td className="symbol">{val.symbol.toUpperCase()}</td>
                <td>{numericData[id].marketCap}</td> {/* Use numeric data here */}
                <td>{numericData[id].price}</td> {/* Use numeric data here */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
