import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard({ user, productsCount, ordersCount, usersCount }) {
  // Simple role check for admin page protection
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p>You do not have permission to view the admin console. Please log in as an Admin.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of Sri Satya Sai Medicals store activities, stock, and orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>
            👑 Admin Mode: {user.name}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p className="stat-val">{usersCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered accounts</span>
        </div>
        <div className="stat-card">
          <h4>Total Medicines</h4>
          <p className="stat-val">{productsCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active catalog products</span>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p className="stat-val">{ordersCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed customer orders</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 style={{ marginBottom: '1rem' }}>Administrative Modules</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <h3>Inventory Management</h3>
          <p style={{ margin: '0.5rem 0 1.25rem 0' }}>Add new medicines, adjust pricing, delete discontinued stock, and monitor quantities.</p>
          <Link to="/admin/medicines" className="btn btn-primary btn-sm">
            Manage Medicines
          </Link>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <h3>User Management</h3>
          <p style={{ margin: '0.5rem 0 1.25rem 0' }}>View customer directory, check contact information, account roles, and remove old users.</p>
          <Link to="/admin/users" className="btn btn-primary btn-sm">
            Manage Users
          </Link>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <h3>Order Fullfilment</h3>
          <p style={{ margin: '0.5rem 0 1.25rem 0' }}>View incoming prescription orders, check purchase total, and review customer names.</p>
          <Link to="/admin/orders" className="btn btn-primary btn-sm">
            Manage Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
