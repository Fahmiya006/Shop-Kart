import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', image: '', category: '', stock: '',
  });

  const headers = { Authorization: `Bearer ${user.token.trim()}` };

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/orders', { headers }),
        axios.get('/api/products'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleProductFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    try {
      await axios.post('/api/products', productForm, { headers });
      alert('✅ Product added!');
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      fetchAll();
    } catch (err) { console.log('Full error:', err.response);
  alert(JSON.stringify(err.response?.data)); }
    
  };

  const handleEditProduct = async () => {
    try {
      await axios.put(`/api/products/${editProduct._id}`, productForm, { headers });
      alert('✅ Product updated!');
      setEditProduct(null);
      setProductForm({ name: '', description: '', price: '', image: '', category: '', stock: '' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update product'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers });
      alert('✅ Product deleted!');
      fetchAll();
    } catch (err) { alert('Failed to delete product'); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status }, { headers });
      fetchAll();
    } catch (err) { alert('Failed to update order status'); }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name, description: product.description,
      price: product.price, image: product.image,
      category: product.category, stock: product.stock,
    });
    setActiveTab('products');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const STATUS_COLORS = {
    Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6',
    Delivered: '#22c55e', Cancelled: '#ef4444',
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', border: '2px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  if (loading) return <div className="admin-loading">⏳ Loading dashboard...</div>;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">⚡ Admin Panel</div>
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            📊 Stats
          </button>
          <button className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📦 Orders
            {pendingOrders > 0 && <span className="nav-badge">{pendingOrders}</span>}
          </button>
          <button className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            🛍️ Products
          </button>
        </nav>
        <button className="admin-nav-btn back-btn" onClick={() => navigate('/')}>
          ← Back to Store
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="admin-section">
            <h2>📊 Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value">{orders.length}</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <p className="stat-label">Pending Orders</p>
                  <p className="stat-value">{pendingOrders}</p>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <p className="stat-label">Delivered</p>
                  <p className="stat-value">{deliveredOrders}</p>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">🛍️</div>
                <div className="stat-info">
                  <p className="stat-label">Total Products</p>
                  <p className="stat-value">{products.length}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#0f172a' }}>🕐 Recent Orders</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <p className="table-name">{order.user?.name || 'User'}</p>
                        <p className="table-sub">{order.user?.email}</p>
                      </td>
                      <td className="table-price">₹{order.totalPrice.toFixed(2)}</td>
                      <td>
                        <span className="status-pill" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="table-sub">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>📦 All Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="empty-state">No orders yet</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td className="order-id-cell">#{order._id.slice(-6).toUpperCase()}</td>
                        <td>
                          <p className="table-name">{order.user?.name || 'User'}</p>
                          <p className="table-sub">{order.user?.email}</p>
                        </td>
                        <td>
                          {order.items.map((item, i) => (
                            <p key={i} className="table-sub">{item.name} ×{item.quantity}</p>
                          ))}
                        </td>
                        <td className="table-price">₹{order.totalPrice.toFixed(2)}</td>
                        <td className="table-sub">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className="status-pill" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="status-select"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>🛍️ Products ({products.length})</h2>
              <button className="btn-add" onClick={() => { setShowAddProduct(true); setEditProduct(null); setProductForm({ name: '', description: '', price: '', image: '', category: '', stock: '' }); }}>
                + Add Product
              </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddProduct || editProduct) && (
              <div className="product-form-card">
                <h3>{editProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                <div className="product-form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input style={inputStyle} name="name" placeholder="Product name" value={productForm.name} onChange={handleProductFormChange} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input style={inputStyle} name="category" placeholder="Electronics, Footwear..." value={productForm.category} onChange={handleProductFormChange} />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input style={inputStyle} name="price" type="number" placeholder="999" value={productForm.price} onChange={handleProductFormChange} />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input style={inputStyle} name="stock" type="number" placeholder="50" value={productForm.stock} onChange={handleProductFormChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Image URL</label>
                    <input style={inputStyle} name="image" placeholder="https://images.unsplash.com/..." value={productForm.image} onChange={handleProductFormChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="description" placeholder="Product description..." value={productForm.description} onChange={handleProductFormChange} />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-save" onClick={editProduct ? handleEditProduct : handleAddProduct}>
                    {editProduct ? '✅ Update Product' : '✅ Add Product'}
                  </button>
                  <button className="btn-cancel" onClick={() => { setShowAddProduct(false); setEditProduct(null); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="products-admin-grid">
              {products.map(product => (
                <div key={product._id} className="product-admin-card">
                  <img src={product.image} alt={product.name} className="product-admin-img" />
                  <div className="product-admin-info">
                    <p className="product-admin-name">{product.name}</p>
                    <p className="product-admin-cat">{product.category}</p>
                    <div className="product-admin-row">
                      <span className="product-admin-price">₹{product.price}</span>
                      <span className="product-admin-stock">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="product-admin-actions">
                    <button className="btn-edit" onClick={() => openEdit(product)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}