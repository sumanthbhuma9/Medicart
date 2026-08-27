import React, { useState } from 'react';
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

// Import Mock Product Data
import { SAMPLE_PRODUCTS } from './data/products';

function App() {
  // --- States ---
  const [user, setUser] = useState(null); // Authenticated user state
  const [products, setProducts] = useState(SAMPLE_PRODUCTS); // Medicine catalog state
  const [cart, setCart] = useState([]); // Cart items [{ product, quantity }] state
  
  // Users database mock state
  const [usersList, setUsersList] = useState([
    { name: 'Admin Owner', email: 'admin@sai.com', phone: '8328579509', role: 'admin' },
    { name: 'Sai Kumar', email: 'customer@sai.com', phone: '8328579509', role: 'customer' },
    { name: 'Vijay Anand', email: 'vijay@sai.com', phone: '9988776655', role: 'customer' },
    { name: 'Deepa Raj', email: 'deepa@sai.com', phone: '8877665544', role: 'customer' }
  ]);

  // Orders database mock state
  const [orders, setOrders] = useState([
    {
      id: 1001,
      customerEmail: 'customer@sai.com',
      items: [{ product: SAMPLE_PRODUCTS[0], quantity: 2 }],
      total: 60.00,
      status: 'Pending',
      date: '2026-08-25'
    },
    {
      id: 1002,
      customerEmail: 'vijay@sai.com',
      items: [{ product: SAMPLE_PRODUCTS[1], quantity: 1 }],
      total: 45.00,
      status: 'Delivered',
      date: '2026-08-24'
    }
  ]);

  // --- Auth Actions ---
  const login = (userObj) => {
    setUser(userObj);
    // Add to user database if they don't already exist
    setUsersList((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === userObj.email.toLowerCase());
      if (exists) return prev;
      return [...prev, userObj];
    });
  };

  const logout = () => {
    setUser(null);
  };

  // --- Cart Actions ---
  const addToCart = (product, qty = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        // Update quantity (cap at stock level)
        const updatedQty = Math.min(existingItem.quantity + qty, product.stock);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: updatedQty } : item
        );
      } else {
        // Add new item
        return [...prevCart, { product, quantity: qty }];
      }
    });
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const stockCap = Math.min(newQty, item.product.stock);
          return { ...item, quantity: stockCap };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const checkout = () => {
    if (cart.length === 0 || !user) return;

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // 1. Subtract product stock in active catalogue state
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    // 2. Create and record a new order object
    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      customerEmail: user.email,
      items: [...cart],
      total: cartTotal,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);

    // 3. Clear cart
    setCart([]);
  };

  // --- Admin Medicine Catalog Actions ---
  const addProduct = (newProd) => {
    const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts((prev) => [...prev, { ...newProd, id: nextId }]);
  };

  const editProduct = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Admin User Database Actions ---
  const addUser = (newUserObj) => {
    setUsersList((prev) => [...prev, newUserObj]);
  };

  const deleteUser = (email) => {
    setUsersList((prev) =>
      prev.filter((u) => u.email.toLowerCase() !== email.toLowerCase())
    );
  };

  // --- Admin Order Fulfillment Actions ---
  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
  };

  // Calculate total unique items in cart for badge
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            <Route path="/user/dashboard" element={<UserDashboard user={user} cart={cart} orders={orders} />} />

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
