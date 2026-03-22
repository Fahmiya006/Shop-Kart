import { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: address, 2: review

  const [address, setAddress] = useState({
    address: '',
    city: '',
    zip: '',
    country: '',
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const { address: addr, city, zip, country } = address;
    if (!addr || !city || !zip || !country) {
      toast.error('Please fill all address fields');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod: 'COD',
        totalPrice: total,
      };
      const token = user.token.trim();

      await axios.post('api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {/* Step Indicator */}
        <div className="steps">
          <div className={`step ₹{step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span>Shipping</span>
          </div>
          <div className="step-line" />
          <div className={`step ₹{step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span>Review</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Left Panel */}
          <div className="checkout-left">
            {step === 1 && (
              <div className="checkout-card">
                <h3>📦 Shipping Address</h3>
                <form onSubmit={handleAddressSubmit} className="checkout-form">
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      name="address"
                      placeholder="123 Main Street"
                      value={address.address}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        name="city"
                        placeholder="New York"
                        value={address.city}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        name="zip"
                        placeholder="10001"
                        value={address.zip}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      name="country"
                      placeholder="United States"
                      value={address.country}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <button type="submit" className="next-btn">
                    Continue to Review →
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <div className="review-header">
                  <h3>📋 Review Your Order</h3>
                  <button onClick={() => setStep(1)} className="edit-btn">Edit Address</button>
                </div>

                <div className="shipping-summary">
                  <p><strong>Ship to:</strong></p>
                  <p>{address.address}, {address.city}, {address.zip}, {address.country}</p>
                </div>

                <div className="order-items">
                  {cart.map((item) => (
                    <div key={item._id} className="review-item">
                      <img src={item.image} alt={item.name} />
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <span className="review-item-price">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="payment-method">
                  <p>💵 Payment Method: <strong>Cash on Delivery</strong></p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="place-order-btn"
                >
                  {loading ? 'Placing Order...' : '🎉 Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Price Summary */}
          <div className="price-summary">
            <h3>Price Details</h3>
            {cart.map((item) => (
              <div key={item._id} className="price-row">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="price-divider" />
            <div className="price-row">
              <span>Shipping</span>
              <span className="free-text">FREE</span>
            </div>
            <div className="price-divider" />
            <div className="price-row total-price-row">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}