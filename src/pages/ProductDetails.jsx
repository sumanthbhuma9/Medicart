import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function ProductDetails({ products, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Find product by matching the URL ID parameter
  const product = products.find((p) => p.id === parseInt(id));

  // If medicine doesn't exist
  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>Medicine Not Found</h2>
        <p>The medicine ID you are looking for does not exist in our catalog.</p>
        <Link to="/products" className="btn btn-primary">
          Back to Medicines
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  // Decrease selected quantity
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Increase selected quantity (cannot exceed available stock)
  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCartClick = () => {
    addToCart(product, quantity);
    // Redirect to cart after adding
    navigate('/cart');
  };

  return (
    <div>
      {/* Breadcrumb / Back Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" style={{ color: 'var(--primary)', fontWeight: '500' }}>
          ← Back to Medicines
        </Link>
      </div>

      <div className="details-container">
        {/* Medicine Image */}
        <div className="details-img-container">
          <img
            src={product.image}
            alt={product.name}
            className="details-img"
          />
        </div>

        {/* Medicine Details Info */}
        <div className="details-info">
          <div>
            <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
              Price: ₹{product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div>
            <h3>Availability</h3>
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : (
              <span className="badge badge-success">
                In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          {/* Action Row */}
          {!isOutOfStock && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Select Quantity</h4>
                <div className="quantity-selector">
                  <button onClick={handleDecrement} className="quantity-btn">
                    -
                  </button>
                  <span className="quantity-val">{quantity}</span>
                  <button onClick={handleIncrement} className="quantity-btn">
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={handleAddToCartClick}
                  className="btn btn-primary"
                  style={{ flexGrow: 1, padding: '0.75rem 1rem' }}
                >
                  Add {quantity} to Cart (₹{(product.price * quantity).toFixed(2)})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
