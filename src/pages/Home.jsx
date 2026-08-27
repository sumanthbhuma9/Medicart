import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function Home({ products, addToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  // Show the first 3 products as "Featured Medicines"
  const featuredProducts = products.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Sri Satya Sai Medicals and General Stores
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--text)', marginBottom: '1.5rem' }}>
          "Your trusted local pharmacy"
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ margin: '0 auto 1.5rem auto' }}>
          <input
            type="text"
            placeholder="Search medicines (e.g., Paracetamol, Cetirizine)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Contact & Location info */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.9rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <div>📍 <strong>Location:</strong> Kanigiri Road, Kandukur</div>
          <div>📞 <strong>Phone Support:</strong> 8328579509</div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Featured Medicines</h2>
          <button onClick={() => navigate('/products')} className="btn btn-secondary btn-sm">
            View All Medicines →
          </button>
        </div>

        {/* Warning Badge / Note */}
        <div className="alert alert-info">
          💡 <strong>Notice:</strong> These products are loaded from static local variables for frontend demonstration and layout testing. Real inventory will sync with the database in the future.
        </div>

        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
