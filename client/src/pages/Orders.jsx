import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_COLORS = {
  Pending: { bg: '#fff8e1', color: '#f59e0b', dot: '#f59e0b' },
  Processing: { bg: '#e3f2fd', color: '#1976d2', dot: '#1976d2' },
  Shipped: { bg: '#e8f5e9', color: '#388e3c', dot: '#388e3c' },
  Delivered: { bg: '#e8f5e9', color: '#2e7d32', dot: '#2e7d32' },
  Cancelled: { bg: '#ffebee', color: '#c62828', dot: '#c62828' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const token = user.token.trim();
      const { data } = await axios.get('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    }
    setLoading(false);
  };
  fetchOrders();
}, [user]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };
  const handleCancelOrder = async (orderId) => {
  if (!window.confirm('Are you sure you want to cancel this order?')) return;
  try {
    await axios.put(`/api/orders/${orderId}/status`,
      { status: 'Cancelled' },
      { headers: { Authorization: `Bearer ${user.token.trim()}` } }
    );
    alert('✅ Order cancelled!');
    // Refresh orders
    const { data } = await axios.get('/api/orders/myorders', {
      headers: { Authorization: `Bearer ${user.token.trim()}` },
    });
    setOrders(data);
  } catch (err) {
    alert('Failed to cancel order');
  }
};

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>My Orders</h1>
          <p className="loading-text">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        <p className="orders-subtitle">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No orders yet</h3>
            <p>When you place orders, they'll appear here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <span
                      className="order-status"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      <span className="status-dot" style={{ background: statusStyle.dot }}></span>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img src={item.image} alt={item.name} className="order-item-img" />
                        <div className="order-item-details">
                          <p className="order-item-name">{item.name}</p>
                          <p className="order-item-qty">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                        </div>
                        <span className="order-item-subtotal">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
  <div className="order-address">
    <span>📍 {order.shippingAddress.city}, {order.shippingAddress.country}</span>
  </div>
  <div className="order-total">
    <span>Total:</span>
    <strong>₹{order.totalPrice.toFixed(2)}</strong>
  </div>
  {order.status === 'Pending' && (
    <button
      onClick={() => handleCancelOrder(order._id)}
      className="cancel-order-btn"
    >
      Cancel Order
    </button>
  )}
</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}