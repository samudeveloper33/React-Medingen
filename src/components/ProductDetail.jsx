import React, { useState, useEffect } from 'react';
import { medicineAPI, configAPI, dataTransformUtils } from '../services/api';
import './ProductDetail.css';

// Component now fetches all data dynamically from backend API

const ProductDetail = () => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [compareMedicines, setCompareMedicines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [alternativeMedicines, setAlternativeMedicines] = useState([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [configLoading, setConfigLoading] = useState(true);

  // No hardcoded data - all data comes from Flask API

  useEffect(() => {
    // Load configuration and medicines from Flask API only
    const loadData = async () => {
      try {
        setLoading(true);
        setCompareLoading(true);
        setConfigLoading(true);
        
        // Load app configuration first
        try {
          const configResponse = await configAPI.getAllConfig();
          setConfig(configResponse.data.config || {});
        } catch (configError) {
          console.error('Error loading configuration:', configError);
          // Continue with default values if config fails
        } finally {
          setConfigLoading(false);
        }
        
        // Get all products from Flask API
        const response = await medicineAPI.getAllMedicines({ per_page: 50 });
        
        const products = response.data.products || response.data || [];
        
        // Process fetched database data
        
        if (products.length > 0) {
          // Use centralized data transformation utility
          const medicines = products.map(product => dataTransformUtils.transformProductFromBackend(product));
          
          setSelectedMedicine(medicines[0]);
          setCompareMedicines(medicines);
          
          // Load alternatives for the first medicine
          loadAlternativeMedicines(medicines[0]);
          
          // Load reviews for the first medicine
          if (medicines[0]) {
            await loadReviews(medicines[0].id);
          }
        } else {
          // Show error if no products in database
          setError(config['error.no_medicines'] || 'No medicines found in database. Please contact administrator.');
        }
      } catch (error) {
        console.error('❌ Error loading medicines:', error);
        setError(config['error.loading_failed'] || 'Failed to load medicines from server. Please try again later.');
      } finally {
        setLoading(false);
        setCompareLoading(false);
      }
    };

    const loadReviews = async (medicineId) => {
      try {
        // Get all recent reviews instead of just for current product
        const reviewResponse = await medicineAPI.getAllReviews({ per_page: 10 });
        const reviewsData = reviewResponse.data.reviews || [];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fallback to product-specific reviews if general reviews fail
        try {
          const productReviewResponse = await medicineAPI.getMedicineReviews(medicineId);
          const productReviewsData = productReviewResponse.data.reviews || [];
          setReviews(productReviewsData);
        } catch (fallbackError) {
          console.error('Fallback review loading also failed:', fallbackError);
          setReviews([]);
        }
      }
    };

    // Load data from Flask API
    loadData();
  }, []);

  // Load all products from database to show in Generic Medicine Alternative section
  const loadAlternativeMedicines = async (currentMedicine) => {
    if (!currentMedicine) return;
    
    try {
      setAlternativesLoading(true);
      // Loading all products for Generic Medicine Alternative section
      
      let allAlternatives = [];
      
      // Fetch ALL medicines from database and show them (except current medicine)
      try {
        const allMedicinesResponse = await medicineAPI.getAllMedicines({ per_page: 1000 });
        const allMedicines = allMedicinesResponse.data.products || allMedicinesResponse.data || [];
        
        // Show ALL products except the currently selected one
        allAlternatives = allMedicines
          .filter(med => med.id !== currentMedicine.id)
          .map(medicine => {
            const transformed = dataTransformUtils.transformProductFromBackend(medicine);
            // Calculate price comparison with current medicine
            const savingsPercent = Math.round(((currentMedicine.price - transformed.price) / currentMedicine.price) * 100);
            return {
              ...transformed,
              alternativeReason: 'all_products',
              savingsPercent: savingsPercent,
              priceComparison: transformed.price < currentMedicine.price ? 'cheaper' : 
                              transformed.price > currentMedicine.price ? 'expensive' : 'same'
            };
          })
          // Sort by price (cheapest first)
          .sort((a, b) => a.price - b.price);
        
        
      } catch (apiError) {
        console.error('⚠️ API call failed for loading all products:', apiError);
        allAlternatives = [];
      }
      
      setAlternativeMedicines(allAlternatives);
      
    } catch (error) {
      console.error('❌ Error loading all products:', error);
      setAlternativeMedicines([]);
    } finally {
      setAlternativesLoading(false);
    }
  };

  // Add medicine to comparison list
  const addToComparison = (medicine) => {
    if (selectedForComparison.length < 4 && !selectedForComparison.find(m => m.id === medicine.id)) {
      setSelectedForComparison([...selectedForComparison, medicine]);
    }
  };

  // Remove medicine from comparison
  const removeFromComparison = (medicineId) => {
    setSelectedForComparison(selectedForComparison.filter(m => m.id !== medicineId));
  };


  if (loading) {
    return (
      <div className="product-detail__loading">
        <div className="container">
          <div className="product-detail__spinner">
            <div className="spinner"></div>
            <p>{config['loading.medicines'] || 'Loading medicine information...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail__error">
        <div className="container">
          <div className="product-detail__error-message">
            <h2>🚨 Medicine Data Not Loading</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              🔄 Try Again
            </button>
          </div>
          
          
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <h3>🔧 Quick Fix Steps:</h3>
            <ol>
              <li><strong>Start Flask Backend:</strong> Open terminal in Flask folder and run <code>python start_server.py</code></li>
              <li><strong>Populate Database:</strong> When prompted, choose 'y' to add sample medicine data</li>
              <li><strong>Start React Frontend:</strong> Run <code>npm start</code> in React folder</li>
              <li><strong>Check Connection:</strong> Verify Flask server is running on http://localhost:5000</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        {selectedMedicine && selectedMedicine.name && (
          <>
            {/* Breadcrumb Navigation */}
            {selectedMedicine.name && (
              <div className="product-detail__breadcrumb-nav">
                <button className="product-detail__back-btn">
                  ← {selectedMedicine.name}
                </button>
              </div>
            )}

            <div className="product-detail__layout">
              {/* Main Content Area */}
              <div className="product-detail__main-content">
                <div className="product-detail__page-header">
                  <h1 className="product-detail__page-title">Medicine Details</h1>
                </div>

                {/* Medicine Information Sections */}
                <div className="product-detail__content-sections">
                  
                  {/* About Section */}
                  <section className="product-detail__section">
                    <h2 className="product-detail__section-title">
                      About {selectedMedicine.name}
                    </h2>
                    <div className="product-detail__section-content">
                      <p className="product-detail__description">
                        {selectedMedicine.description}
                      </p>
                    </div>
                  </section>

                  {/* Uses Section */}
                  <section className="product-detail__section">
                    <h2 className="product-detail__section-title">
                      Uses of {selectedMedicine.name}
                    </h2>
                    <div className="product-detail__section-content">
                      <ul className="product-detail__uses-list">
                        {selectedMedicine.uses && selectedMedicine.uses.map((use, index) => (
                          <li key={index}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* How it Works Section */}
                  <section className="product-detail__section">
                    <h2 className="product-detail__section-title">
                      How {selectedMedicine.name} Works
                    </h2>
                    <div className="product-detail__section-content">
                      {selectedMedicine.howItWorks && (
                        <p className="product-detail__description">
                          {selectedMedicine.howItWorks}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Side Effects Section */}
                  <section className="product-detail__section">
                    <h2 className="product-detail__section-title">
                      Side Effects Of {selectedMedicine.name}
                    </h2>
                    <div className="product-detail__section-content">
                      <p className="product-detail__side-effects-intro">
                        Common Side Effects of {selectedMedicine.name}
                      </p>
                      <ul className="product-detail__side-effects-list">
                        {selectedMedicine.sideEffects && selectedMedicine.sideEffects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                  
                </div>
              </div>

              {/* Alternatives Sidebar */}
              <div className="product-detail__sidebar">
                <div className="product-detail__alternatives">
                  <h3 className="product-detail__alternatives-title">
                    Generic Medicine Alternative
                  </h3>
                  
                  {alternativesLoading ? (
                    <div className="alternatives-loading">
                      <div className="loading-spinner"></div>
                      <p>{config['loading.alternatives'] || 'Loading all products...'}</p>
                    </div>
                  ) : (
                    <div className="product-detail__alternatives-list">
                      {alternativeMedicines && alternativeMedicines.length > 0 ? (
                        alternativeMedicines.map(medicine => (
                      <div 
                        key={medicine.id} 
                        className="product-detail__alternative-item"
                        data-category={medicine.alternativeReason}
                      >
                        <div className="product-detail__alternative-image">
                          {(medicine.image || medicine.imageUrl) ? (
                            <img 
                              src={medicine.image || medicine.imageUrl} 
                              alt={medicine.name}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                // Hide image if fails to load
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              color: '#6b7280',
                              fontWeight: 'bold'
                            }}>
                              {medicine.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="product-detail__alternative-info">
                          <h4 className="product-detail__alternative-name">{medicine.name}</h4>
                          <p className="product-detail__alternative-manufacturer">{medicine.manufacturer}</p>
                          <div className="product-detail__alternative-price">
                            <span>₹{medicine.discountedPrice || medicine.price}</span>
                            {medicine.savingsPercent > 0 ? (
                              <span className="product-detail__alternative-discount savings">
                                {medicine.savingsPercent}% less
                              </span>
                            ) : medicine.savingsPercent < 0 ? (
                              <span className="product-detail__alternative-discount expensive">
                                {Math.abs(medicine.savingsPercent)}% more
                              </span>
                            ) : (
                              <span className="product-detail__alternative-discount same">
                                Same price
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="product-detail__alternative-add"
                          onClick={() => addToComparison(medicine)}
                        >
                          + Add
                        </button>
                      </div>
                        ))
                      ) : (
                        <div className="no-alternatives">
                          <p>No products available in the database.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compare Medicine Section */}
            <section className="product-detail__compare-section">
              <div className="compare-section">
                <h2 className="compare-section__title">{config['compare.section.title'] || 'Compare medicine'}</h2>
                <p className="compare-section__subtitle">
                  {config['compare.section.subtitle'] || 'Compare medicine price comparison to make your decision'}
                </p>
                
                {compareLoading ? (
                  <div className="compare-loading">
                    <div className="loading-spinner"></div>
                    <p>{config['loading.comparison'] || 'Loading comparison data...'}</p>
                  </div>
                ) : (
                  <div className="compare-grid">
                    {compareMedicines && compareMedicines
                      .sort((a, b) => b.rating - a.rating) // Sort by rating, highest first
                      .slice(0, 4).map((medicine, index) => (
                    <div key={medicine.id} className="compare-card">
                      {/* Medicine Image from Database */}
                      <div className="compare-card__image">
                        {(medicine.image || medicine.imageUrl) ? (
                          <img 
                            src={medicine.image || medicine.imageUrl} 
                            alt={`${medicine.name} medicine`}
                            style={{
                              width: '120px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb'
                            }}
                            onError={(e) => {
                              // Fallback to blue pill pack icon if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        {/* SVG icon - shows when no database image or image fails */}
                        <div className="pill-pack-icon" style={{ display: (medicine.image || medicine.imageUrl) ? 'none' : 'block' }}>
                          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                            <rect x="4" y="4" width="112" height="72" rx="8" fill="#2563eb" stroke="#1d4ed8" strokeWidth="3"/>
                            {/* 5x4 grid of pills */}
                            {[...Array(20)].map((_, i) => (
                              <circle 
                                key={i} 
                                cx={16 + (i % 5) * 20} 
                                cy={16 + Math.floor(i / 5) * 16} 
                                r="6" 
                                fill="#60a5fa"
                              />
                            ))}
                          </svg>
                        </div>
                      </div>
                      
                      {/* Medicine Info */}
                      <div className="compare-card__content">
                        <h3 className="compare-card__name">{medicine.name}</h3>
                        <p className="compare-card__manufacturer">
                          By {medicine.manufacturer}
                        </p>
                        
                        {/* Generic Name */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Generic Name:</span>
                          <span className="compare-detail__value">{medicine.genericName} {medicine.name.includes('mg') ? medicine.name.match(/\d+mg/)?.[0] : ''}</span>
                        </div>
                        
                        {/* Average Price */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Average Price:</span>
                          <span className="compare-detail__value">Rs {medicine.price}</span>
                        </div>
                        
                        {/* Price Comparison */}
                        <div className="compare-card__price-section">
                          <div className="price-row">
                            <span className="price-label">Original Price</span>
                            {medicine.discount > 0 && (
                              <span className="discount-badge">{medicine.discount}% Off</span>
                            )}
                          </div>
                          <div className="price-row">
                            <span className="price-original">Rs. {medicine.price}</span>
                            {medicine.discount > 0 && (
                              <span className="price-discounted">Rs. {medicine.discountedPrice}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Chemical Formation */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Chemical formation:</span>
                          <span className="compare-detail__value">{medicine.chemicalFormula}</span>
                        </div>
                        
                        {/* Ratings & Review */}
                        <div className="compare-card__rating">
                          <span className="rating-label">Ratings & Review</span>
                          <div className="rating-display">
                            <div className="rating-stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                  key={star} 
                                  className={`star ${star <= Math.round(medicine.rating) ? 'filled' : 'empty'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="rating-number">{medicine.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {medicine.description && (
                          <div className="compare-card__description">
                            <p>{medicine.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
                
                {selectedForComparison.length > 0 && (
                  <div className="selected-comparison">
                    <h3>Selected for Comparison ({selectedForComparison.length}/4)</h3>
                    <div className="selected-medicines">
                      {selectedForComparison && selectedForComparison.map(medicine => (
                        <div key={medicine.id} className="selected-medicine-item">
                          <span>{medicine.name}</span>
                          <button 
                            onClick={() => removeFromComparison(medicine.id)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="btn-compare-all">
                      Compare Selected ({selectedForComparison.length})
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="product-detail__faq-section">
              <div className="faq-section">
                <h2 className="faq-section__title">Frequently asked questions for {selectedMedicine.genericName}</h2>
                
                <div className="faq-list">
                  <div className="faq-item">
                    <h3 className="faq-question">{selectedMedicine.genericName}</h3>
                    
                    {selectedMedicine.faqContent && selectedMedicine.faqContent.length > 0 ? (
                      selectedMedicine.faqContent && selectedMedicine.faqContent.map((faq, index) => (
                        <div key={index} className="faq-answer">
                          <p><strong>Q. {faq.question}</strong></p>
                          <p>{faq.answer}</p>
                        </div>
                      ))
                    ) : (
                      <div className="faq-answer">
                        <p><strong>Q. How should I take {selectedMedicine.name}?</strong></p>
                        <p>Please consult your healthcare provider for specific dosage instructions and guidance on how to take this medicine safely.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Ratings & Review Section */}
            <section className="product-detail__ratings-section">
              <div className="ratings-section">
                <h2 className="ratings-section__title">Customer Reviews</h2>
                
                <div className="reviews-list">
                  {reviews && reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-rating">
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span 
                                key={star} 
                                className={`star ${star <= review.rating ? 'filled' : 'empty'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="rating-score">{review.rating}.0</span>
                        </div>
                        <div className="review-content">
                          <p className="review-text">"{review.comment}"</p>
                          <p className="review-author">- {review.user_name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="review-item">
                      <div className="review-rating">
                        <div className="rating-stars">
                          {[1, 2, 3, 4].map(star => (
                            <span key={star} className="star filled">★</span>
                          ))}
                          <span className="star empty">★</span>
                        </div>
                        <span className="rating-score">{selectedMedicine.rating}</span>
                      </div>
                      <div className="review-content">
                        <p className="review-text">"No reviews available yet. Be the first to review this medicine!"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Disclaimer Section */}
            <section className="product-detail__disclaimer-section">
              <div className="disclaimer-section">
                <h2 className="disclaimer-section__title">{config['disclaimer.title'] || 'Disclaimer:'}</h2>
                <p className="disclaimer-section__text">
                  {config['disclaimer.content']}
                </p>
              </div>
            </section>

            {/* Trust Indicators Section */}
            <section className="product-detail__trust-section">
              <div className="trust-section">
                <div className="trust-indicators">
                  <div className="trust-indicator">
                    <div className="trust-indicator__icon trust-indicator__icon--payment">
                      <div className="payment-icon">
                        <div className="card-stack">
                          <div className="card card-1"></div>
                          <div className="card card-2"></div>
                          <div className="card card-3"></div>
                        </div>
                        <div className="shield-icon">
                          <div className="shield">
                            <div className="shield-check">✓</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="trust-indicator__content">
                      <h3 className="trust-indicator__title">{config['trust.payment.title'] || 'Safe and Secured'}</h3>
                      <p className="trust-indicator__subtitle">{config['trust.payment.subtitle'] || 'Payment'}</p>
                    </div>
                  </div>

                  <div className="trust-indicator">
                    <div className="trust-indicator__icon trust-indicator__icon--authentic">
                      <div className="authentic-icon">
                        <div className="shield-bg">
                          <div className="check-mark">✓</div>
                        </div>
                        <div className="medicine-bottle">
                          <div className="bottle-body"></div>
                          <div className="bottle-cap"></div>
                        </div>
                      </div>
                    </div>
                    <div className="trust-indicator__content">
                      <h3 className="trust-indicator__title">{config['trust.authentic.title'] || '100% Authentic'}</h3>
                      <p className="trust-indicator__subtitle">{config['trust.authentic.subtitle'] || 'Products'}</p>
                    </div>
                  </div>

                  <div className="trust-indicator">
                    <div className="trust-indicator__icon trust-indicator__icon--customers">
                      <div className="customers-icon">
                        <div className="celebration-burst">
                          <div className="burst-ray burst-1"></div>
                          <div className="burst-ray burst-2"></div>
                          <div className="burst-ray burst-3"></div>
                          <div className="burst-ray burst-4"></div>
                        </div>
                        <div className="people-group">
                          <div className="person person-1"></div>
                          <div className="person person-2"></div>
                          <div className="person person-3"></div>
                        </div>
                      </div>
                    </div>
                    <div className="trust-indicator__content">
                      <h3 className="trust-indicator__title">{config['trust.customers.title'] || '6 lac + Happy'}</h3>
                      <p className="trust-indicator__subtitle">{config['trust.customers.subtitle'] || 'Customers'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
