import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { FaCheckCircle } from 'react-icons/fa';
import './Order.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/api/orders/${encodeURIComponent(id)}`);
        if (!isMounted) return;
        setOrder(data);
      } catch (err) {
        if (!isMounted) return;
        setOrder(null);
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Order not found.');
        } else {
          setError('Unable to load order details right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-page container">
        <div className="status-card glass-card">
          <h2>{error || 'Order not found'}</h2>
          <p>Check your order link or browse restaurants from the home page.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page container">
      <div className="success-card glass-card">
        <FaCheckCircle className="success-icon" />
        <h2>Order Status: {order.status}</h2>
        <p className="order-id">
          Order ID: <strong>{order._id}</strong>
        </p>
        <p>
          Delivering to <strong>{order.customer?.name}</strong> at{' '}
          <em>{order.customer?.address}</em>
        </p>

        <div className="order-items-list">
          {order.orderItems.map((item) => (
            <div key={item.foodItem} className="order-item-mini">
              <span>
                {item.qty} x {item.name}
              </span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>${order.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>${order.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <span>${order.totalPrice.toFixed(2)}</span>
        </div>

        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
