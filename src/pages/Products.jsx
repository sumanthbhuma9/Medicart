import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function Products({ products, addToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(36);

  // Sync search input with URL search parameter if present
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
    setVisibleCount(36); // Reset pagination on search change
  }, [searchParams]);

  // Handle local search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setVisibleCount(36);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Filter medicines by name, category, or composition description
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    );
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 36);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Medicines Catalogue</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
            Search through our Indian medicine database ({filteredProducts.length.toLocaleString()} medicines found).
          </p>
        </div>
      </div>

      {/* Search Input & Controls */}
      <div className="search-container" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search medicines by name, category, or active ingredient..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          style={{ maxWidth: '500px' }}
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

      {/* Product Results Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="product-grid">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={handleLoadMore}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: '600' }}
              >
                Load More Medicines ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <h3>No medicines found matching "{searchTerm}"</h3>
          <p>Try searching for terms like "Augmentin", "Paracetamol", "Azithral", or "Syrup".</p>
        </div>
      )}
    </div>
  );
}

export default Products;
