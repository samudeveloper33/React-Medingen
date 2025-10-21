import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Offers from './Offers';
import Notifications from './Notifications';
import Cart from './Cart';
import './Header.css';

// Modern SVG Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const OffersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="8" r="6"/>
    <path d="m13 13 5 5"/>
    <path d="m21 3-1 1"/>
    <path d="m20 4 1 1"/>
    <path d="m19 3 2 2"/>
    <path d="M9 7 7 9"/>
  </svg>
);

const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cartItems] = useState(0); // Cart items count
  const [notifications] = useState(0); // Notifications count
  const [activeSection, setActiveSection] = useState('home'); // Track active section
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setShowUserDropdown(false);
  };

  const handleNavClick = (section) => {
    // Set active section
    setActiveSection(section);
    setIsMenuOpen(false);
    
    // Handle different navigation sections
    switch(section) {
      case 'home':
        // Scroll to top or navigate to home
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'offers':
        // Navigate to offers section
        const offersSection = document.getElementById('offers');
        if (offersSection) {
          offersSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Create and show offers content
          showOffersModal();
        }
        break;
      case 'notifications':
        // Show notifications dropdown or modal
        showNotificationsModal();
        break;
      case 'profile':
        // Show profile menu or navigate to profile
        if (user) {
          showProfileModal();
        } else {
          setShowLogin(true);
        }
        break;
      default:
        // Unknown section
    }
  };

  const showOffersModal = () => {
    setShowOffers(true);
  };

  const showNotificationsModal = () => {
    setShowNotifications(true);
  };

  const showProfileModal = () => {
    setShowProfileMenu(!showProfileMenu);
  };


  const handleCartClick = () => {
    setShowCart(true);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          {/* Logo Section */}
          <div className="header__logo">
            <div className="header__logo-icon">
              <span className="header__logo-text">MIG</span>
            </div>
            <span className="header__brand-name">Medingen</span>
          </div>

          {/* Navigation Menu */}
          <nav className="header__nav">
            <div className="header__nav-desktop">
              <button 
                className={`header__nav-item ${activeSection === 'home' ? 'header__nav-item--active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                <span className="header__nav-icon"><HomeIcon /></span>
                <span className="header__nav-text">Home</span>
              </button>
              <button 
                className={`header__nav-item ${activeSection === 'offers' ? 'header__nav-item--active' : ''}`}
                onClick={() => handleNavClick('offers')}
              >
                <span className="header__nav-icon"><OffersIcon /></span>
                <span className="header__nav-text">Offers</span>
              </button>
              <button 
                className={`header__nav-item ${activeSection === 'notifications' ? 'header__nav-item--active' : ''}`}
                onClick={() => handleNavClick('notifications')}
              >
                <span className="header__nav-icon"><NotificationIcon /></span>
                <span className="header__nav-text">Notification</span>
                {notifications > 0 && (
                  <span className="header__nav-badge">{notifications}</span>
                )}
              </button>
              <div className="header__nav-profile" ref={profileMenuRef}>
                <button 
                  className={`header__nav-item ${activeSection === 'profile' ? 'header__nav-item--active' : ''}`}
                  onClick={() => handleNavClick('profile')}
                >
                  <span className="header__nav-icon"><ProfileIcon /></span>
                  <span className="header__nav-text">Profile</span>
                </button>
                {showProfileMenu && (
                  <div className="header__profile-dropdown">
                    <div className="header__profile-header">
                      <div className="header__profile-avatar">👤</div>
                      <div className="header__profile-info">
                        <h3>Welcome!</h3>
                        <p>{user?.name || 'User'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Action Icons */}
          <div className="header__actions">
            <button className="header__action-btn header__cart-btn" onClick={handleCartClick}>
              <span className="header__action-icon"><CartIcon /></span>
              {cartItems > 0 && (
                <span className="header__cart-badge">{cartItems}</span>
              )}
            </button>
            
            {user ? (
              <div className="header__user-menu" ref={dropdownRef}>
                <button 
                  className="header__user-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <span className="header__user-avatar"><ProfileIcon /></span>
                  <span className="header__user-name">{user.name}</span>
                </button>
                {showUserDropdown && (
                  <div className="header__user-dropdown">
                    <button onClick={handleLogout} className="header__logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="header__login-btn"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
            )}

            <button 
              className="header__menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="header__mobile-menu">
            <button 
              className={`header__mobile-link ${activeSection === 'home' ? 'header__mobile-link--active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              <span className="header__mobile-icon"><HomeIcon /></span>
              Home
            </button>
            <button 
              className={`header__mobile-link ${activeSection === 'offers' ? 'header__mobile-link--active' : ''}`}
              onClick={() => handleNavClick('offers')}
            >
              <span className="header__mobile-icon"><OffersIcon /></span>
              Offers
            </button>
            <button 
              className={`header__mobile-link ${activeSection === 'notifications' ? 'header__mobile-link--active' : ''}`}
              onClick={() => handleNavClick('notifications')}
            >
              <span className="header__mobile-icon"><NotificationIcon /></span>
              Notification
              {notifications > 0 && (
                <span className="header__mobile-badge">{notifications}</span>
              )}
            </button>
            <button 
              className={`header__mobile-link ${activeSection === 'profile' ? 'header__mobile-link--active' : ''}`}
              onClick={() => handleNavClick('profile')}
            >
              <span className="header__mobile-icon"><ProfileIcon /></span>
              Profile
            </button>
            {user ? (
              <>
                <span className="header__mobile-user">Hi, {user.name}</span>
                <button onClick={handleLogout} className="header__mobile-logout">
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="header__mobile-login"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
            )}
          </div>
        )}

        {showLogin && (
          <Login onClose={() => setShowLogin(false)} />
        )}
        
        {showOffers && (
          <Offers onClose={() => setShowOffers(false)} />
        )}
        
        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}
        
        {showCart && (
          <Cart onClose={() => setShowCart(false)} />
        )}
      </div>
    </header>
  );
};

export default Header;
