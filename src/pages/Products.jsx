import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function Products({ products, addToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Sync search input with the URL search query parameter if present
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
  }, [searchParams]);

  // Handle local typing search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Update the URL parameter on change
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Filter medicines by name or category
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Medicines Catalogue</h1>
        <p>Browse and search through our current list of available medicines.</p>
      </div>

      {/* Temporary sample data notice */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        📋 <strong>Developer Note:</strong> The catalogue below is displaying mock data. When the backend is connected, this page will fetch live data from the SQL/NoSQL database via Axios.
      </div>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search medicines by name or category..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          style={{ maxWidth: '400px' }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchParams({})}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Product Results */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <h3>No medicines found matching "{searchTerm}"</h3>
          <p>Try searching for general terms like "Paracetamol" or "Vitamin".</p>
        </div>
      )}
    </div>
  );
}

export default Products;
