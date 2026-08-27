import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AdminMedicines({ user, products, addProduct, editProduct, deleteProduct, usersCount, ordersCount }) {
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Input states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Simple Admin Role Verification
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p>You do not have permission to access medicine settings.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  // Open Form to Add Medicine
  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setCategory('');
    setPrice('');
    setStock('');
    setDescription('');
    setImageUrl('');
    setShowForm(true);
  };

  // Open Form to Edit existing Medicine
  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setDescription(product.description);
    setImageUrl(product.image);
    setShowForm(true);
  };

  // Delete product action
  const handleDeleteClick = (id) => {
    deleteProduct(id);
  };

  // Form submit handler (Adding or Editing)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !category || !price || !stock || !description) {
      alert('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid stock amount.');
      return;
    }

    // Default image if URL is empty
    const imgToSave = imageUrl.trim() || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><rect x='45' y='30' width='10' height='40' fill='%2394a3b8'/><rect x='30' y='45' width='40' height='10' fill='%2394a3b8'/></svg>";

    if (isEditing) {
      editProduct({
        id: editingId,
        name,
        category,
        price: priceNum,
        stock: stockNum,
        description,
        image: imgToSave
      });
      alert('Medicine updated successfully!');
    } else {
      addProduct({
        name,
        category,
        price: priceNum,
        stock: stockNum,
        description,
        image: imgToSave
      });
      alert('New medicine added successfully!');
    }

    // Reset and hide form
    setShowForm(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Manage Medicines</h1>
          <p>Create, update, or remove medicines from the e-commerce website.</p>
        </div>
        {!showForm && (
          <button onClick={handleAddNewClick} className="btn btn-primary">
            ➕ Add Medicine
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats" style={{ marginTop: '1rem' }}>
        <div className="stat-card">
          <h4>Total Users</h4>
          <p className="stat-val">{usersCount}</p>
        </div>
        <div className="stat-card">
          <h4>Total Medicines</h4>
          <p className="stat-val">{products.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p className="stat-val">{ordersCount}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {isEditing ? '📝 Edit Medicine' : '➕ Add New Medicine'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Medicine Name *</label>
              <input
                type="text"
                placeholder="e.g. Paracetamol 650mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                placeholder="e.g. Analgesic, Antibiotics, Vitamin"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                placeholder="Provide medical description and usage instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{ height: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for default placeholder SVG icon"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                {isEditing ? 'Save Medicine' : 'Save Medicine'}
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

      {/* Medicines Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: '#f1f5f9', borderRadius: '4px' }}
                  />
                </td>
                <td style={{ fontWeight: '600' }}>{product.name}</td>
                <td>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    {product.category}
                  </span>
                </td>
                <td>₹{product.price.toFixed(2)}</td>
                <td>
                  {product.stock <= 0 ? (
                    <span className="badge badge-danger">Out of Stock</span>
                  ) : (
                    <span>{product.stock} units</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className="btn btn-danger btn-sm"
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

export default AdminMedicines;
