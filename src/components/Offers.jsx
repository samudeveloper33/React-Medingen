import React, { useState, useRef, useEffect } from 'react';
import './Offers.css';

const Offers = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(true);
  const categoriesRef = useRef(null);

  const offers = [
    {
      id: 1,
      title: "Mega Medicine Sale",
      discount: "20% OFF",
      description: "Get 20% off on all medicines. Valid for prescription and OTC medicines.",
      code: "MEDI20",
      validTill: "2025-11-15",
      category: "general",
      image: "💊",
      minOrder: 500,
      maxDiscount: 200
    },
    {
      id: 2,
      title: "Free Home Delivery",
      discount: "FREE",
      description: "Free delivery on orders above ₹500. No delivery charges!",
      code: "FREEDEL",
      validTill: "2025-12-31",
      category: "delivery",
      image: "🚚",
      minOrder: 500,
      maxDiscount: 100
    },
    {
      id: 3,
      title: "Vitamin Combo Deal",
      discount: "Buy 2 Get 1 FREE",
      description: "Buy any 2 vitamin supplements and get 1 absolutely free!",
      code: "VIT3FOR2",
      validTill: "2025-10-31",
      category: "vitamins",
      image: "🍊",
      minOrder: 300,
      maxDiscount: 500
    },
    {
      id: 4,
      title: "First Order Special",
      discount: "30% OFF",
      description: "Special discount for first-time customers. Maximum discount ₹300.",
      code: "FIRST30",
      validTill: "2025-12-31",
      category: "new",
      image: "🎁",
      minOrder: 200,
      maxDiscount: 300
    },
    {
      id: 5,
      title: "Prescription Upload Bonus",
      discount: "15% OFF",
      description: "Upload your prescription and get instant 15% discount.",
      code: "PRESCR15",
      validTill: "2025-11-30",
      category: "prescription",
      image: "📋",
      minOrder: 250,
      maxDiscount: 150
    },
    {
      id: 6,
      title: "Health Checkup Package",
      discount: "40% OFF",
      description: "Complete health checkup packages at discounted rates.",
      code: "HEALTH40",
      validTill: "2025-10-25",
      category: "health",
      image: "🩺",
      minOrder: 1000,
      maxDiscount: 800
    }
  ];

  const categories = [
    { id: 'all', name: 'All Offers', icon: '🏷️' },
    { id: 'general', name: 'Medicine', icon: '💊' },
    { id: 'delivery', name: 'Delivery', icon: '🚚' },
    { id: 'vitamins', name: 'Vitamins', icon: '🍊' },
    { id: 'new', name: 'New Users', icon: '🎁' },
    { id: 'prescription', name: 'Prescription', icon: '📋' },
    { id: 'health', name: 'Health Care', icon: '🩺' }
  ];

  const filteredOffers = selectedCategory === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === selectedCategory);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      // Visual feedback instead of alert - could be replaced with toast notification
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.style.backgroundColor = '#10b981';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      console.log(`Coupon code: ${code}`);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check scroll position and update scroll button visibility
  const checkScrollPosition = () => {
    const container = categoriesRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowScrollLeft(scrollLeft > 0);
      setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Effect to check initial scroll position and add event listener
  useEffect(() => {
    const container = categoriesRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      
      // Check on resize too
      const handleResize = () => checkScrollPosition();
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div className="offers-modal">
      <div className="offers-modal__overlay" onClick={onClose}></div>
      <div className="offers-modal__content">
        {/* Header */}
        <div className="offers-header">
          <div className="offers-header__title">
            <h2>🏷️ Special Offers & Deals</h2>
            <p>Save more on your medicines and healthcare needs</p>
          </div>
          <button className="offers-header__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Categories */}
        <div className="offers-categories-wrapper">
          {showScrollLeft && (
            <button className="offers-scroll-btn offers-scroll-btn--left" onClick={scrollLeft}>
              ‹
            </button>
          )}
          <div className="offers-categories" ref={categoriesRef}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`offers-category ${selectedCategory === category.id ? 'offers-category--active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="offers-category__icon">{category.icon}</span>
                <span className="offers-category__name">{category.name}</span>
              </button>
            ))}
          </div>
          {showScrollRight && (
            <button className="offers-scroll-btn offers-scroll-btn--right" onClick={scrollRight}>
              ›
            </button>
          )}
        </div>

        {/* Offers Grid */}
        <div className="offers-grid">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-card__header">
                <div className="offer-card__icon">{offer.image}</div>
                <div className="offer-card__discount">{offer.discount}</div>
              </div>
              
              <div className="offer-card__content">
                <h3 className="offer-card__title">{offer.title}</h3>
                <p className="offer-card__description">{offer.description}</p>
                
                <div className="offer-card__details">
                  <div className="offer-card__detail">
                    <span className="offer-card__label">Min Order:</span>
                    <span className="offer-card__value">₹{offer.minOrder}</span>
                  </div>
                  <div className="offer-card__detail">
                    <span className="offer-card__label">Max Discount:</span>
                    <span className="offer-card__value">₹{offer.maxDiscount}</span>
                  </div>
                  <div className="offer-card__detail">
                    <span className="offer-card__label">Valid Till:</span>
                    <span className="offer-card__value">{formatDate(offer.validTill)}</span>
                  </div>
                </div>

                <div className="offer-card__code">
                  <span className="offer-card__code-text">Code: {offer.code}</span>
                  <button 
                    className="offer-card__copy-btn"
                    onClick={() => handleCopyCode(offer.code)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="offer-card__footer">
                <button className="offer-card__use-btn">
                  Use This Offer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="offers-empty">
            <div className="offers-empty__icon">📭</div>
            <h3>No offers available</h3>
            <p>No offers found in this category. Check other categories!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
