import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Sri Satya Sai Medicals and General Stores</h3>
        <p>Your trusted local pharmacy providing quality medicines and healthcare essentials.</p>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: '0.25rem 0' }}>
            📍 <strong>Address:</strong> Kanigiri Road, Kandukur
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            📞 <strong>Phone:</strong> 8328579509
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} Sri Satya Sai Medicals. All rights reserved. (Frontend Demonstration Model)
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
