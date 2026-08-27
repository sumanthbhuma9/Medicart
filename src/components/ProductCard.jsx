import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, addToCart }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="card">
      {/* Medicine Image */}
      <div className="card-img-container">
        <img
          src={product.image}
          alt={product.name}
          className="card-img"
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        <span className="card-category">{product.category}</span>
        <h4 className="card-title">{product.name}</h4>
        <p style={{ fontSize: '0.8rem', height: '2.4rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.description}
        </p>

        {/* Stock status indicator */}
        <div className="card-stock">
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : (
            <span className="badge badge-success">In Stock ({product.stock} left)</span>
          )}
        </div>

        {/* Price */}
        <div className="card-price">
          ₹{product.price.toFixed(2)}
        </div>

        {/* Card Actions */}
        <div className="card-actions">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-secondary"
            style={{ flexGrow: 1, textAlign: 'center' }}
          >
            Details
          </Link>
          <button
            onClick={() => addToCart(product)}
            className="btn btn-primary"
            disabled={isOutOfStock}
            style={{ flexGrow: 2 }}
          >
            {isOutOfStock ? 'No Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
