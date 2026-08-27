import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, logout, cartCount }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Name */}
        <Link
          to={user && user.role === 'admin' ? '/admin/medicines' : '/'}
          className="navbar-logo"
        >
          🏥 Sri Satya Sai Medicals
        </Link>

        {/* Navigation Links */}
        <ul className="navbar-links">
          {/* Admin Navigation */}
          {user && user.role === 'admin' ? (
            <>
              <li>
                <Link to="/admin/medicines" className="navbar-link">
                  Admin Medicines
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="navbar-link">
                  Admin Users
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="navbar-link">
                  Admin Orders
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="navbar-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Logout ({user.name})
                </button>
              </li>
            </>
          ) : (
            // Customer / General Navigation
            <>
              <li>
                <Link to="/" className="navbar-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="navbar-link">
                  Medicines
                </Link>
              </li>
              <li>
                <Link to="/cart" className="navbar-link">
                  Cart
                  {cartCount > 0 && (
                    <span className="navbar-cart-badge">{cartCount}</span>
                  )}
                </Link>
              </li>
              
              {user ? (
                // If Customer is logged in
                <>
                  <li>
                    <Link to="/orders" className="navbar-link">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="navbar-link">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="navbar-link"
                      style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Logout ({user.name})
                    </button>
                  </li>
                </>
              ) : (
                // If visitor is logged out
                <>
                  <li>
                    <Link to="/login" className="navbar-link">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="navbar-link">
                      Signup
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
