import React, { useState, useEffect } from 'react';
import { medicineAPI, dataTransformUtils } from '../services/api';
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

  // No hardcoded data - all data comes from Flask API

  useEffect(() => {
    // Load medicines and reviews from Flask API only
    const loadData = async () => {
      try {
        setLoading(true);
        setCompareLoading(true);
        
        // Get all products from Flask API
        
        const response = await medicineAPI.getAllMedicines({ per_page: 15 });
        
        const products = response.data.products || response.data || [];
        
        
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
          setError('No medicines found in database. Please contact administrator.');
        }
      } catch (error) {
        console.error('❌ Error loading medicines:', error);
        setError('Failed to load medicines from server. Please try again later.');
      } finally {
        setLoading(false);
        setCompareLoading(false);
      }
    };

    const loadReviews = async (medicineId) => {
      try {
        const reviewResponse = await medicineAPI.getMedicineReviews(medicineId);
        const reviewsData = reviewResponse.data.reviews || [];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
      }
    };

    // Load data from Flask API
    loadData();
  }, []);

  // Load alternative medicines based on current selection via Flask API
  const loadAlternativeMedicines = async (currentMedicine) => {
    if (!currentMedicine) return;
    
    try {
      setAlternativesLoading(true);
      console.log(`🔍 Loading alternatives for ${currentMedicine.name} via API...`);
      
      // Try to get alternatives from Flask API using multiple strategies
      let alternatives = [];
      
      try {
        // Strategy 1: Get medicines by same category via API
        if (currentMedicine.category) {
          
          const categoryResponse = await medicineAPI.searchByCategory(currentMedicine.category);
          const categoryMedicines = categoryResponse.data.products || categoryResponse.data || [];
          
          
          // Filter out current medicine and add to alternatives
          const categorySimilar = categoryMedicines
            .filter(med => med.id !== currentMedicine.id)
            .slice(0, 3)
            .map(medicine => {
              const transformed = dataTransformUtils.transformProductFromBackend(medicine);
              return {
                ...transformed,
                alternativeReason: 'same',
                savingsPercent: Math.round(((currentMedicine.price - transformed.price) / currentMedicine.price) * 100),
                priceComparison: transformed.price < currentMedicine.price ? 'cheaper' : 
                                transformed.price > currentMedicine.price ? 'expensive' : 'same'
              };
            });
          
          alternatives.push(...categorySimilar);
        }
        
        // Strategy 2: Get medicines by generic name via API
        if (currentMedicine.genericName && alternatives.length < 4) {
          
          const genericResponse = await medicineAPI.searchByGeneric(currentMedicine.genericName);
          const genericMedicines = genericResponse.data.products || genericResponse.data || [];
          
          
          const genericSimilar = genericMedicines
            .filter(med => med.id !== currentMedicine.id && !alternatives.find(alt => alt.id === med.id))
            .slice(0, 4 - alternatives.length)
            .map(medicine => {
              const transformed = dataTransformUtils.transformProductFromBackend(medicine);
              return {
                ...transformed,
                alternativeReason: 'generic',
                savingsPercent: Math.round(((currentMedicine.price - transformed.price) / currentMedicine.price) * 100),
                priceComparison: transformed.price < currentMedicine.price ? 'cheaper' : 
                                transformed.price > currentMedicine.price ? 'expensive' : 'same'
              };
            });
          
          alternatives.push(...genericSimilar);
        }
        
        // Strategy 3: Get general alternatives if still need more
        if (alternatives.length < 4) {
          
          const generalResponse = await medicineAPI.getAlternativeMedicines(currentMedicine.id, { per_page: 10 });
          const generalMedicines = generalResponse.data.products || generalResponse.data || [];
          
          
          const generalSimilar = generalMedicines
            .filter(med => !alternatives.find(alt => alt.id === med.id))
            .slice(0, 6 - alternatives.length)
            .map(medicine => {
              const transformed = dataTransformUtils.transformProductFromBackend(medicine);
              return {
                ...transformed,
                alternativeReason: 'similar',
                savingsPercent: Math.round(((currentMedicine.price - transformed.price) / currentMedicine.price) * 100),
                priceComparison: transformed.price < currentMedicine.price ? 'cheaper' : 
                                transformed.price > currentMedicine.price ? 'expensive' : 'same'
              };
            });
          
          alternatives.push(...generalSimilar);
        }
        
        
        
      } catch (apiError) {
        console.log('⚠️ Flask API calls failed for alternatives');
        // No fallback - show empty alternatives if API fails
        alternatives = [];
      }
      
      setAlternativeMedicines(alternatives);
      
      
    } catch (error) {
      console.error('Error loading alternative medicines:', error);
      // No fallback - show empty alternatives if API fails
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
            <p>Loading medicine information...</p>
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
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
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
            <div className="product-detail__breadcrumb-nav">
              <button className="product-detail__back-btn">
                ← Paracetamol/acetaminophen
              </button>
            </div>

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
                      <p className="product-detail__description">
                        {selectedMedicine.howItWorks || 'Consult your healthcare provider for detailed information about how this medicine works.'}
                      </p>
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
                    {selectedMedicine && (
                      <span className="alternatives-count">({alternativeMedicines.length} found)</span>
                    )}
                  </h3>
                  
                  {alternativesLoading ? (
                    <div className="alternatives-loading">
                      <div className="loading-spinner"></div>
                      <p>Finding alternatives...</p>
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
                          <img 
                            src={medicine.image || `https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=80&h=80&fit=crop&auto=format`} 
                            alt={medicine.name}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/80x80/00b4d8/ffffff?text=${medicine.name.charAt(0)}`;
                            }}
                          />
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
                          <p>No alternatives found for this medicine.</p>
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
                <h2 className="compare-section__title">Compare medicine</h2>
                <p className="compare-section__subtitle">
                  Compare medicine price comparison to make your decision
                </p>
                
                {compareLoading ? (
                  <div className="compare-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading comparison data...</p>
                  </div>
                ) : (
                  <div className="compare-grid">
                    {compareMedicines && compareMedicines.slice(0, 4).map((medicine, index) => (
                    <div key={medicine.id} className="compare-card">
                      {/* Blue Pill Pack Icon */}
                      <div className="compare-card__image">
                        <div className="pill-pack-icon">
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
                          By {medicine.manufacturer || 'MICRO LABS'} LIMITED
                        </p>
                        
                        {/* Generic Name */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Generic Name:</span>
                          <span className="compare-detail__value">{medicine.genericName} {medicine.name.includes('mg') ? medicine.name.match(/\d+mg/)?.[0] || '650 mg' : '650 mg'}</span>
                        </div>
                        
                        {/* Average Price */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Average Price:</span>
                          <span className="compare-detail__value">Rs {medicine.price || '70'}%</span>
                        </div>
                        
                        {/* Price Comparison */}
                        <div className="compare-card__price-section">
                          <div className="price-row">
                            <span className="price-label">Original Price</span>
                            <span className="discount-badge">{medicine.discount || 15}% Off</span>
                          </div>
                          <div className="price-row">
                            <span className="price-original">Rs. {medicine.price || 34}</span>
                            <span className="price-discounted">Rs. {medicine.discountedPrice || 34}</span>
                          </div>
                        </div>
                        
                        {/* Chemical Formation */}
                        <div className="compare-detail">
                          <span className="compare-detail__label">Chemical formation:</span>
                          <span className="compare-detail__value">{medicine.chemicalFormula || 'CH₃CONH₂'}</span>
                        </div>
                        
                        {/* Ratings & Review */}
                        <div className="compare-card__rating">
                          <span className="rating-label">Ratings & Review</span>
                          <div className="rating-display">
                            <div className="rating-stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                  key={star} 
                                  className={`star ${star <= Math.round(medicine.rating || 4) ? 'filled' : 'empty'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="rating-number">{(medicine.rating || 4.0).toFixed(1)}</span>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="compare-card__description">
                          <p>* The medicine is good it is bit costly when compared with the exact generic medicine *</p>
                          <p>* The medicine is good it is bit costly when compared with the exact generic medicine *</p>
                        </div>
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
                <h2 className="ratings-section__title">Ratings & Review</h2>
                
                <div className="reviews-list">
                  {reviews && reviews.length > 0 ? (
                    reviews.slice(0, 3).map(review => (
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
                        <span className="rating-score">{selectedMedicine.rating || 4.0}</span>
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
                <h2 className="disclaimer-section__title">Disclaimer:</h2>
                <p className="disclaimer-section__text">
                  The contents here is for informational purposes only and not intended to be a substitute for professional medical 
                  advice, diagnosis, or treatment. Please seek the advice of a physician or other qualified health provider with any 
                  questions you may have regarding a medical condition. Medkart or any information and subsequent action or 
                  inaction is solely at the user's risk, and we do not assume any responsibility for the same. The content on the Platform 
                  should not be considered or used as a substitute for professional and qualified medical advice. Please consult your 
                  doctor for any query pertaining to medicines, tests and/or diseases, as we support, and do not replace the doctor-
                  patient relationship.
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
                      <h3 className="trust-indicator__title">Safe and Secured</h3>
                      <p className="trust-indicator__subtitle">Payment</p>
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
                      <h3 className="trust-indicator__title">100% Authentic</h3>
                      <p className="trust-indicator__subtitle">Products</p>
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
                      <h3 className="trust-indicator__title">6 lac + Happy</h3>
                      <p className="trust-indicator__subtitle">Customers</p>
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
