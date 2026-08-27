import React from 'react';
import { Link } from 'react-router-dom';

function UserDashboard({ user, cart, orders }) {
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
  const myOrdersCount = orders.filter(o => o.customerEmail === user.email).length;
  // Get cart items count
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Manage your account, track active orders, and search for medicines.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
            {cartItemsCount}
          </div>
          <Link to="/cart" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Cart
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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
            {myOrdersCount}
          </div>
          <Link to="/orders" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            My Orders
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
          <h4>Profile Details</h4>
          <p style={{ margin: '0.75rem 0', fontSize: '0.85rem' }}>
            Phone: {user.phone || '8328579509'}
          </p>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Profile
          </Link>
        </div>
      </div>

      {/* Main navigation shortcut */}
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <h3>Need Medicines?</h3>
        <p style={{ margin: '0.5rem 0 1.5rem 0' }}>Search and order your regular prescriptions online.</p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          Browse Medicines Catalogue
        </Link>
      </div>
    </div>
  );
}

export default UserDashboard;
