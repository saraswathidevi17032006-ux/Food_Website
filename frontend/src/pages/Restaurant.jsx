import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import FoodCard from '../components/FoodCard';
import './Restaurant.css';

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/api/restaurants/${encodeURIComponent(id)}`);
        if (!isMounted) return;
        setRestaurant(data.restaurant);
        setMenu(data.menu || []);
      } catch (err) {
        if (!isMounted) return;
        setRestaurant(null);
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Restaurant not found.');
        } else {
          setError('Unable to load restaurant details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRestaurant();
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

  if (error || !restaurant) {
    return (
      <div className="container">
        <div className="status-card glass-card">
          <h2>{error || 'Restaurant not found'}</h2>
          <p>Explore other restaurants available on BiteDash.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page container">
      <div className="restaurant-banner glass-card">
        <div className="banner-img">
          <img src={restaurant.image} alt={restaurant.name} />
        </div>
        <div className="banner-info">
          <h1>{restaurant.name}</h1>
          <p className="categories-list">{restaurant.categories.join(' • ')}</p>
          <div className="meta-info">
            <div className="meta-item">
              <FaStar className="icon-star" />
              <span>{restaurant.rating} Rating</span>
            </div>
            <div className="meta-item">
              <FaMapMarkerAlt className="icon-primary" />
              <span>{restaurant.location}</span>
            </div>
            <div className="meta-item">
              <FaClock className="icon-primary" />
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-section">
        <h2>Menu</h2>
        {menu.length === 0 ? (
          <p>No menu items available.</p>
        ) : (
          <div className="grid foods-grid">
            {menu.map((food) => (
              <FoodCard key={food._id} food={{ ...food, restaurant }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurant;
