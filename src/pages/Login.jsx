import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ login }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Mock Authentication Logic
    // We check credentials locally for demonstration:
    let userRole = 'customer';
    let userName = 'Rahul Kumar';
    let userPhone = '8328579509';

    if (email.toLowerCase() === 'admin@sai.com') {
      if (password === 'admin123') {
        userRole = 'admin';
        userName = 'Admin Owner';
      } else {
        setError('Incorrect password for Admin.');
        return;
      }
    } else if (email.toLowerCase() === 'customer@sai.com') {
      if (password === 'customer123') {
        userRole = 'customer';
        userName = 'Sai Kumar';
      } else {
        setError('Incorrect password for Customer.');
        return;
      }
    } else {
      // General signup fallback simulation
      userRole = 'customer';
      userName = email.split('@')[0];
    }

    // Call login state setting function
    login({
      name: userName,
      email: email,
      phone: userPhone,
      role: userRole
    });

    // Redirect based on role
    if (userRole === 'admin') {
      navigate('/admin/medicines');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div>
      <div className="form-container">
        <h2 className="form-title">Account Login</h2>

        {/* Demo instructions */}
        <div className="alert alert-info" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          <strong>🔑 Testing Credentials:</strong>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
            <li><strong>Admin:</strong> admin@sai.com (pass: admin123)</li>
            <li><strong>Customer:</strong> customer@sai.com (pass: customer123)</li>
          </ul>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. customer@sai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Log In
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up</Link>
        </p>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
          🔒 Note: Session security will be handled later via backend JWT.
        </div>
      </div>
    </div>
  );
}

export default Login;
