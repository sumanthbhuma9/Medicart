import React from 'react';
import { Link } from 'react-router-dom';

function AdminOrders({ user, orders, updateOrderStatus }) {
  // Simple Admin Role Verification
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p>You do not have permission to view store orders.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  // Helper to step status forward
  const handleUpdateStatus = (id, currentStatus) => {
    let nextStatus = 'Pending';
    if (currentStatus === 'Pending') {
      nextStatus = 'Shipped';
    } else if (currentStatus === 'Shipped') {
      nextStatus = 'Delivered';
    } else {
      alert('Order is already fully delivered!');
      return;
    }
    updateOrderStatus(id, nextStatus);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Store Orders</h1>
          <p>Review customer purchases, order status, and dispatch details.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: '3rem 1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <h3>No Orders Found</h3>
          <p>No customer orders have been placed in the system yet.</p>
        </div>
      ) : (
        /* Orders Listing Table */
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Date</th>
                <th>Purchased Items</th>
                <th>Total Paid</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id || order._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{order.id || order.numId || order._id}</td>
                  <td>{order.customerEmail}</td>
                  <td>{order.date}</td>
                  <td>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', margin: 0 }}>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.product?.name || 'Medicine'} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    ₹{(order.total || 0).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${
                      order.status === 'Delivered'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {order.status !== 'Delivered' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id || order._id, order.status)}
                          className="btn btn-secondary btn-sm"
                        >
                          Mark as {order.status === 'Pending' ? 'Shipped' : 'Delivered'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivered ✅</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
