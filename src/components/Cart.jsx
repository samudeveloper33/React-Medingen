import React from 'react';
import './Cart.css';

const Cart = ({ onClose }) => {
  return (
    <div className="cart-modal">
      <div className="cart-modal__backdrop" onClick={onClose}></div>
      <div className="cart-modal__content">
        <div className="cart-header">
          <h2 className="cart-title">
            <span className="cart-icon">🛒</span>
            Shopping Cart
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="cart-close-btn"
          >
            ×
          </button>
        </div>
        
        <div className="cart-body">
          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6"/>
              </svg>
            </div>
            <h3 className="cart-empty-title">Your cart is currently empty</h3>
            <p className="cart-empty-message">
              Browse medicines and add items to your cart for quick checkout!
            </p>
          </div>
        </div>
        
        <div className="cart-footer">
          <button 
            className="cart-continue-btn"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
