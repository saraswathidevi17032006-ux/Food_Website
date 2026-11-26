import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaUtensils, FaSearch } from 'react-icons/fa';
import { useCart } from '../context/useCart';
import './Navbar.css';

const Navbar = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get('keyword') || '';
  const [draftTerm, setDraftTerm] = useState(null);

  const searchValue = draftTerm !== null ? draftTerm : urlKeyword;

  const submitHandler = (e) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    setDraftTerm(null);
    if (trimmed) {
      navigate(`/?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="navbar glass-card">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setDraftTerm(null)}>
          <FaUtensils className="logo-icon" />
          <span>BiteDash</span>
        </Link>

        <form onSubmit={submitHandler} className="search-form" role="search">
          <input
            type="search"
            className="search-input"
            placeholder="Search food or restaurants..."
            aria-label="Search food or restaurants"
            value={searchValue}
            onChange={(e) => setDraftTerm(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        <nav className="navbar-links">
          <Link to="/cart" className="cart-link">
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="cart-icon" />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
