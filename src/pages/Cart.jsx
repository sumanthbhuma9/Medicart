import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart({ cart, updateCartQuantity, removeFromCart, checkout, user }) {
  const navigate = useNavigate();

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      alert('Please log in or sign up to complete your checkout.');
      navigate('/login');
      return;
    }
    
    // Call the checkout prop to create order and clear cart
    checkout();
    alert('Order placed successfully! You can track it in the My Orders tab.');
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>🛒 Your Cart is Empty</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Looks like you haven't added any medicines yet.
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items">
          {cart.map((item) => {
            const productTotal = item.product.price * item.quantity;
            return (
              <div className="cart-item" key={item.product.id}>
                {/* Product Name & Category */}
                <div className="cart-item-info">
                  <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    {item.product.category}
                  </span>
                </div>

                {/* Price per unit */}
                <div style={{ fontWeight: '500' }}>
                  ₹{item.product.price.toFixed(2)} each
                </div>

                {/* Quantity Controls */}
                <div className="quantity-selector">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="quantity-btn"
                    style={{ padding: '0.1rem 0.5rem', fontSize: '1rem' }}
                  >
                    -
                  </button>
                  <span className="quantity-val" style={{ fontSize: '0.95rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="quantity-btn"
                    disabled={item.quantity >= item.product.stock}
                    style={{ padding: '0.1rem 0.5rem', fontSize: '1rem' }}
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div style={{ fontWeight: '700', minWidth: '80px', textAlign: 'right' }}>
                  ₹{productTotal.toFixed(2)}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="btn btn-danger btn-sm"
                  title="Remove item"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Cart Summary Panel */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row" style={{ marginTop: '0.5rem' }}>
            <span>Items count:</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span style={{ color: 'var(--success)' }}>FREE</span>
          </div>

          <div className="summary-row summary-total">
            <span>Total Amount:</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
          >
            Proceed to Checkout
          </button>

          <Link
            to="/products"
            className="btn btn-secondary"
            style={{ width: '100%', textAlign: 'center' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
