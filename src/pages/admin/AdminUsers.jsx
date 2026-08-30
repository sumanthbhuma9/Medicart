import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AdminUsers({ user, usersList, addUser, deleteUser }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Simple Admin Role Verification
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p>You do not have permission to view store users.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  // Handle delete user
  const handleDelete = (emailToDelete) => {
    if (emailToDelete.toLowerCase() === user.email.toLowerCase()) {
      alert('You cannot delete your own admin account.');
      return;
    }
    deleteUser(emailToDelete);
  };

  // Handle add user submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      alert('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Add user to database / state
    addUser({ name, email, phone, password, role });

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('customer');
    setShowForm(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Manage Users</h1>
          <p>Review store accounts, roles, and register new customers or admins.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            ➕ Add User
          </button>
        )}
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>➕ Register New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Kumar Sai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="e.g. kumar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 8328579509"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <option value="customer">Customer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                Save User
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
                style={{ flexGrow: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((usr) => (
              <tr key={usr.email}>
                <td style={{ fontWeight: '600' }}>{usr.name}</td>
                <td>{usr.email}</td>
                <td>{usr.phone}</td>
                <td>
                  <span className={`badge ${usr.role === 'admin' ? 'badge-danger' : 'badge-success'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {usr.role}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleDelete(usr.email)}
                      className="btn btn-danger btn-sm"
                      disabled={usr.email.toLowerCase() === user.email.toLowerCase()}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
