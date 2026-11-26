import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaUtensils, FaSearch, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
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
  const firstName = user?.name?.split(' ')[0];

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
          {user ? (
            <div className="nav-auth-user">
              <span className="nav-user-name">
                <FaUser /> {firstName}
              </span>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
                aria-label="Logout"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-links">
              <Link to="/login" className="nav-auth-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary nav-register-btn">
                Register
              </Link>
            </div>
          )}

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
