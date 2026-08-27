import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function UserDashboard({ user, cart, orders, updateCartQuantity, removeFromCart, checkout }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>Customer Dashboard</h2>
        <p>Please log in to view your dashboard.</p>
        <Link to="/login" className="btn btn-primary">Log In</Link>
      </div>
    );
  }

  // Get user-specific orders count
  const myOrders = orders.filter(o => o.customerEmail?.toLowerCase() === user.email?.toLowerCase());
  const myOrdersCount = myOrders.length;
  
  // Get cart items count and total
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    checkout();
    alert('Order placed successfully from your Dashboard! You can track it below.');
    navigate('/orders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)' }}>Welcome back, {user.name}!</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
            Customer Account ({user.email}) | Phone: {user.phone || '8328579509'}
          </p>
        </div>
        <Link to="/products" className="btn btn-primary">
          ➕ Order Medicines Now
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Cart Status card */}
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <h4>Items in Cart</h4>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
            {cartItemsCount}
          </div>
          <Link to="/cart" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Full Cart
          </Link>
        </div>

        {/* Order count card */}
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <h4>Total Orders</h4>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
            {myOrdersCount}
          </div>
          <Link to="/orders" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            My Past Orders
          </Link>
        </div>

        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <h4>Account Profile</h4>
          <p style={{ margin: '0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Role: <span className="badge badge-success">Customer</span>
          </p>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Profile Details
          </Link>
        </div>
      </div>

      {/* Cart Items Management Section (Direct Delete/Update in Dashboard) */}
      <section style={{
        backgroundColor: 'var(--surface)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>🛒 Manage Cart Medicines</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Review, adjust quantity, or delete medicines directly from your dashboard.
            </p>
          </div>
          {cart.length > 0 && (
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
              Total: ₹{cartTotal.toFixed(2)}
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Your cart is currently empty.</p>
            <Link to="/products" className="btn btn-primary btn-sm">
              Browse Medicines Catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const prodId = item.product.id || item.product._id;
                    const lineTotal = item.product.price * item.quantity;
                    return (
                      <tr key={prodId}>
                        <td style={{ fontWeight: '600' }}>{item.product.name}</td>
                        <td>
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            {item.product.category}
                          </span>
                        </td>
                        <td>₹{item.product.price.toFixed(2)}</td>
                        <td>
                          <div className="quantity-selector" style={{ justifyContent: 'flex-start' }}>
                            <button
                              onClick={() => updateCartQuantity(prodId, item.quantity - 1)}
                              className="quantity-btn"
                              style={{ padding: '0.1rem 0.4rem' }}
                            >
                              -
                            </button>
                            <span className="quantity-val" style={{ padding: '0 0.5rem' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(prodId, item.quantity + 1)}
                              className="quantity-btn"
                              disabled={item.quantity >= item.product.stock}
                              style={{ padding: '0.1rem 0.4rem' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>₹{lineTotal.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => removeFromCart(prodId)}
                            className="btn btn-danger btn-sm"
                            title="Delete medicine from cart"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleCheckoutClick}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
              >
                Checkout Now (₹{cartTotal.toFixed(2)})
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserDashboard;
