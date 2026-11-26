import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/useCart';
import { formatINR } from '../utils/currency';
import { FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import './FoodDetails.css';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFood = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/api/food/${encodeURIComponent(id)}`);
        if (!isMounted) return;
        setFood(data);
      } catch (err) {
        if (!isMounted) return;
        setFood(null);
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Food item not found.');
        } else {
          setError('Unable to load food item. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFood();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    addToCart(food, qty);
    navigate('/cart');
  };

  const increaseQty = () => {
    setQty((prev) => prev + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="container">
        <div className="status-card glass-card">
          <h2>{error || 'Food item not found'}</h2>
          <p>Browse our full menu on the home page.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="food-details-page container">
      <div className="food-details-card glass-card">
        <div className="food-image-section">
          <img src={food.image} alt={food.name} />
        </div>

        <div className="food-info-section">
          <div className="food-header">
            {food.isVegetarian && <span className="veg-label">Vegetarian</span>}
            <h1 className="food-title">{food.name}</h1>
            <p className="restaurant-name">By {food.restaurant?.name || 'Local Restaurant'}</p>
          </div>

          <div className="food-price-large">{formatINR(food.price)}</div>

          <div className="food-description">
            <h3>Description</h3>
            <p>{food.description}</p>
          </div>

          <div className="purchase-section">
            <div className="quantity-selector">
              <button
                type="button"
                className="qty-btn"
                onClick={decreaseQty}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <FaMinus />
              </button>
              <span className="qty-display">{qty}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={increaseQty}
                aria-label="Increase quantity"
              >
                <FaPlus />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary add-to-cart-large"
              onClick={handleAddToCart}
            >
              <FaShoppingCart /> Add to Cart - {formatINR(food.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
