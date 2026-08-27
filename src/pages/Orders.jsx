import React from 'react';
import { Link } from 'react-router-dom';

function Orders({ orders, user }) {
  // If user is not logged in, prompt them to log in
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>My Orders</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Please log in to view your past orders and tracking statuses.
        </p>
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  // Filter orders placed by this specific user
  const userOrders = orders.filter(
    (order) => order.customerEmail === user.email
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>My Orders</h1>
        <p>Track delivery statuses and view details of your previous orders.</p>
      </div>

      {userOrders.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '3rem 1rem',
          textAlign: 'center'
        }}>
          <h3>No Orders Placed Yet</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't placed any medical orders yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Order Medicines Now
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {userOrders.map((order) => (
            <div className="order-card" key={order.id}>
              {/* Header Info */}
              <div className="order-header">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID: </span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>#{order.id}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                  <span>{order.date}</span>
                </div>
              </div>

              {/* Order items and totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>Items Ordered:</h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product.name} x {item.quantity} (₹{item.product.price.toFixed(2)} each)
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>Status: </span>
                    <span className={`badge ${
                      order.status === 'Delivered'
                        ? 'badge-success'
                        : order.status === 'Shipped'
                        ? 'badge-warning'
                        : 'badge-warning'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Paid: </span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                      ₹{order.total.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
