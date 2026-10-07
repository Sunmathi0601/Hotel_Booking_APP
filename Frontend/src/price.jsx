import { useState } from "react";
import "./price.css";

const Price = ({ onApplyFilters }) => {
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");

  const applyFilters = (event) => {
    event.preventDefault();
    const minimum = Number(minPrice);
    const maximum = maxPrice === "" ? null : Number(maxPrice);

    if (maximum !== null && maximum < minimum) {
      setError("Maximum price must be at least the minimum price.");
      return;
    }

    setError("");
    onApplyFilters({ name: name.trim(), minPrice: minimum, maxPrice: maximum });
  };

  return (
    <form className="search-bar" onSubmit={applyFilters}>
      <input
        aria-label="Hotel name"
        type="search"
        placeholder="Search hotel name..."
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <select
        aria-label="Minimum price"
        value={minPrice}
        onChange={(event) => setMinPrice(event.target.value)}
      >
        <option value="0">Any minimum</option>
        <option value="1000">₹1,000</option>
        <option value="2000">₹2,000</option>
        <option value="5000">₹5,000</option>
        <option value="10000">₹10,000</option>
        <option value="20000">₹20,000</option>
        <option value="50000">₹50,000</option>
      </select>

      <select
        aria-label="Maximum price"
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
      >
        <option value="">Any maximum</option>
        <option value="5000">₹5,000</option>
        <option value="10000">₹10,000</option>
        <option value="15000">₹15,000</option>
        <option value="20000">₹20,000</option>
        <option value="50000">₹50,000</option>
        <option value="100000">₹1,00,000</option>
      </select>

      <button type="submit">☷ &nbsp; Filter</button>
      {error && <p className="filter-error" role="alert">{error}</p>}
    </form>
  );
};

export default Price
