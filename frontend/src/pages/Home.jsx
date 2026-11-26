import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import RestaurantCard from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import './Home.css';

const CATEGORIES = ['All', 'Burger', 'Pizza', 'Biryani', 'Dosa', 'Noodles'];

const Home = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const restaurantsSectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const trimmed = keyword.trim();
        const restQuery = trimmed ? `?keyword=${encodeURIComponent(trimmed)}` : '';

        const foodParams = new URLSearchParams();
        if (trimmed) foodParams.set('keyword', trimmed);
        if (selectedCategory !== 'All') foodParams.set('category', selectedCategory);
        const foodQuery = foodParams.toString() ? `?${foodParams.toString()}` : '';

        const [restRes, foodRes] = await Promise.all([
          api.get(`/api/restaurants${restQuery}`),
          api.get(`/api/food${foodQuery}`),
        ]);
        if (!isMounted) return;
        setRestaurants(restRes.data);
        setFoods(foodRes.data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Unable to load menu right now. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [keyword, selectedCategory, retryCount]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home container">
        <div className="status-card glass-card">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setRetryCount((c) => c + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home container">
      {!keyword && (
        <section className="hero-section glass-card">
          <div className="hero-content">
            <h1>Craving something?</h1>
            <p>Get the best food from top restaurants delivered to your door.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => restaurantsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Now
            </button>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
              alt="Delicious Food"
            />
          </div>
        </section>
      )}

      {keyword && (
        <div className="search-results-header">
          <h2 className="search-results-title">Search Results for &ldquo;{keyword}&rdquo;</h2>
          <Link to="/" className="btn btn-outline">
            Clear Search
          </Link>
        </div>
      )}

      <section className="section" ref={restaurantsSectionRef}>
        <h2 className="section-title">Popular Restaurants</h2>
        {restaurants.length === 0 ? (
          <p>No restaurants found.</p>
        ) : (
          <div className="grid restaurants-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header-row">
          <h2 className="section-title">Popular Food Items</h2>
          <div className="category-pills" role="tablist" aria-label="Food categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        {foods.length === 0 ? (
          <p>No food items found.</p>
        ) : (
          <div className="grid foods-grid">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
