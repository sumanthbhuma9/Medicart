import React from 'react';
import { Link } from 'react-router-dom';

function Profile({ user }) {
  // If user is not logged in
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>User Profile</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Please log in to view and edit your profile details.
        </p>
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>My Account Profile</h1>

      <div className="profile-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 auto 1rem auto'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name}</h2>
          <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
            {user.role} Account
          </span>
        </div>

        {/* Profile Info Fields */}
        <div className="profile-info-row">
          <span className="profile-info-label">Full Name</span>
          <span className="profile-info-value">{user.name}</span>
        </div>
        <div className="profile-info-row">
          <span className="profile-info-label">Email Address</span>
          <span className="profile-info-value">{user.email}</span>
        </div>
        <div className="profile-info-row">
          <span className="profile-info-label">Phone Number</span>
          <span className="profile-info-value">{user.phone || '8328579509'}</span>
        </div>
        <div className="profile-info-row">
          <span className="profile-info-label">Account Role</span>
          <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>
            {user.role}
          </span>
        </div>

        {/* Dashboard Link Shortcut */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          {user.role === 'admin' ? (
            <Link to="/admin/medicines" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Admin Medicines
            </Link>
          ) : (
            <Link to="/products" className="btn btn-primary" style={{ width: '100%' }}>
              Browse Medicines Catalog
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
