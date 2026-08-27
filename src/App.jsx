import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import User Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';

// Import API Services
import { productsAPI, ordersAPI, usersAPI, authAPI } from './services/api';

function App() {
  // --- States ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync cart with localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- Fetch Functions ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await productsAPI.getAll();
      if (res.data) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await ordersAPI.getAll();
      if (res.data) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await usersAPI.getAll();
      if (res.data) {
        setUsersList(res.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Check auth session & load initial data
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      await fetchProducts();
      setLoading(false);
    };

    initApp();
  }, [fetchProducts]);

  // Load orders & users when user state changes
  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === 'admin') {
        fetchUsers();
      }
    } else {
      setOrders([]);
      setUsersList([]);
    }
  }, [user, fetchOrders, fetchUsers]);

  // --- Auth Actions ---
  const login = (userObj, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCart([]);
    setOrders([]);
    setUsersList([]);
  };

  // --- Cart Actions ---
  const getProdId = (p) => String(p.id || p._id);

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    const targetId = getProdId(product);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProdId(item.product) === targetId);
      if (existingItem) {
        const updatedQty = Math.min(existingItem.quantity + qty, product.stock || 999);
        return prevCart.map((item) =>
          getProdId(item.product) === targetId ? { ...item, quantity: updatedQty } : item
        );
      } else {
        return [...prevCart, { product, quantity: qty }];
      }
    });
  };

  const updateCartQuantity = (productId, newQty) => {
    const targetId = String(productId);
    if (newQty <= 0) {
      removeFromCart(targetId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (getProdId(item.product) === targetId) {
          const stockCap = Math.min(newQty, item.product.stock || 999);
          return { ...item, quantity: stockCap };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    const targetId = String(productId);
    setCart((prevCart) => prevCart.filter((item) => getProdId(item.product) !== targetId));
  };

  const checkout = async () => {
    if (cart.length === 0 || !user) return;

    try {
      await ordersAPI.create({
        items: cart,
        customerEmail: user.email,
      });

      setCart([]);
      localStorage.removeItem('cart');
      await fetchProducts();
      await fetchOrders();
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    }
  };

  // --- Admin Medicine Catalog Actions ---
  const addProduct = async (newProd) => {
    try {
      const res = await productsAPI.create(newProd);
      const created = res.data || newProd;
      setProducts((prev) => [created, ...prev]);
      alert('Medicine created successfully in database!');
    } catch (error) {
      console.error('Add medicine error:', error);
      alert(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  const editProduct = async (updatedProd) => {
    try {
      const targetId = getProdId(updatedProd);
      const res = await productsAPI.update(targetId, updatedProd);
      const updated = res.data || updatedProd;
      setProducts((prev) =>
        prev.map((p) => (getProdId(p) === targetId ? { ...p, ...updated } : p))
      );
      alert('Medicine updated successfully in database!');
    } catch (error) {
      console.error('Edit medicine error:', error);
      alert(error.response?.data?.message || 'Failed to update medicine');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const targetId = String(id);
      await productsAPI.delete(targetId);
      setProducts((prev) => prev.filter((p) => getProdId(p) !== targetId));
      alert('Medicine deleted successfully from database!');
    } catch (error) {
      console.error('Delete medicine error:', error);
      alert(error.response?.data?.message || 'Failed to delete medicine');
    }
  };

  // --- Admin User Database Actions ---
  const addUser = async (newUserObj) => {
    try {
      const res = await usersAPI.create(newUserObj);
      const created = res.data || newUserObj;
      setUsersList((prev) => [created, ...prev]);
      alert('User created successfully in database!');
    } catch (error) {
      console.error('Add user error:', error);
      alert(error.response?.data?.message || 'Failed to add user');
    }
  };

  const deleteUser = async (emailOrId) => {
    try {
      const target = String(emailOrId).toLowerCase();
      await usersAPI.delete(target);
      setUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== target && String(u._id) !== target));
      alert('User deleted successfully from database!');
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // --- Admin Order Fulfillment Actions ---
  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      const targetId = String(orderId);
      await ordersAPI.updateStatus(targetId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (String(o.id || o._id) === targetId ? { ...o, status: nextStatus } : o))
      );
      alert(`Order status updated to ${nextStatus}!`);
    } catch (error) {
      console.error('Update order status error:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Calculate total unique items in cart for badge
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary, #10b981)' }}>Connecting to Medicart Server...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar */}
        <Navbar user={user} logout={logout} cartCount={cartItemCount} />

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            {/* General & Customer Routes */}
            <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
            <Route path="/products" element={<Products products={products} addToCart={addToCart} />} />
            <Route path="/products/:id" element={<ProductDetails products={products} addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} checkout={checkout} user={user} />} />
            <Route path="/orders" element={<Orders orders={orders} user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/signup" element={<Signup login={login} />} />
            <Route path="/user/dashboard" element={<UserDashboard user={user} cart={cart} orders={orders} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} checkout={checkout} />} />

            {/* Admin Management Routes */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin/medicines" replace />} />
            <Route path="/admin/medicines" element={<AdminMedicines user={user} products={products} addProduct={addProduct} editProduct={editProduct} deleteProduct={deleteProduct} usersCount={usersList.length} ordersCount={orders.length} />} />
            <Route path="/admin/users" element={<AdminUsers user={user} usersList={usersList} addUser={addUser} deleteUser={deleteUser} />} />
            <Route path="/admin/orders" element={<AdminOrders user={user} orders={orders} updateOrderStatus={updateOrderStatus} />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
