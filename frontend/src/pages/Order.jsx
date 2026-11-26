import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { formatINR } from '../utils/currency';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import './Order.css';

const Order = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const itemsPrice = getCartTotal();
  const grandTotal = itemsPrice + deliveryFee;

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const trimmedCustomer = {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
    };

    if (
      !trimmedCustomer.name ||
      !trimmedCustomer.email ||
      !trimmedCustomer.phone ||
      !trimmedCustomer.address
    ) {
      toast.error('Please fill in all delivery details.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/api/orders', {
        orderItems: cartItems.map((item) => ({
          foodItem: item.foodItem,
          qty: item.qty,
        })),
        customer: trimmedCustomer,
      });

      setOrderId(data._id);
      setOrderSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="order-page container">
        <div className="success-card glass-card">
          <FaCheckCircle className="success-icon" />
          <h2>Order Confirmed!</h2>
          <p>Thank you for your order, {customer.name}.</p>
          <p className="order-id">
            Order ID: <strong>{orderId}</strong>
          </p>
          <p>
            Your delicious food is being prepared and will be delivered to{' '}
            <em>{customer.address}</em> soon.
          </p>
          <div className="order-actions">
            <Link to={`/orders/${orderId}`} className="btn btn-outline">
              View Order Details
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="order-page container">
        <div className="status-card glass-card">
          <h2>Your cart is empty</h2>
          <p>Add some items before proceeding to checkout.</p>
          <Link to="/" className="btn btn-primary">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page container">
      <h1 className="page-title">Checkout</h1>

      <div className="order-layout">
        <div className="checkout-form-section">
          <form className="glass-card form-card" onSubmit={placeOrderHandler}>
            <h2>Delivery Details</h2>

            <div className="form-group">
              <label htmlFor="customer-name">Full Name</label>
              <input
                id="customer-name"
                type="text"
                name="name"
                className="input-field"
                value={customer.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-email">Email Address</label>
              <input
                id="customer-email"
                type="email"
                name="email"
                className="input-field"
                value={customer.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-phone">Phone Number</label>
              <input
                id="customer-phone"
                type="tel"
                name="phone"
                className="input-field"
                value={customer.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-address">Delivery Address</label>
              <textarea
                id="customer-address"
                name="address"
                className="input-field"
                rows="3"
                value={customer.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary place-order-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <div className="glass-card summary-card">
            <h2>Order Summary</h2>
            <div className="order-items-list">
              {cartItems.map((item) => (
                <div key={item.foodItem} className="order-item-mini">
                  <span>
                    {item.qty} x {item.name}
                  </span>
                  <span>{formatINR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatINR(itemsPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{formatINR(deliveryFee)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
