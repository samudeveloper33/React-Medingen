const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('medingen_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.access_token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Helper function to handle logout on auth failure
const handleAuthFailure = () => {
  localStorage.removeItem('medingen_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Base fetch function with common headers and error handling
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Add auth token if available
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      handleAuthFailure();
      throw new Error('Authentication failed');
    }

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function to parse JSON response
const parseResponse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Invalid response format');
  }
};

// Medicine/Product API endpoints
export const medicineAPI = {
  // Get all products/medicines with pagination and search
  getAllMedicines: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
  
  // Get product/medicine by ID with detailed info
  getMedicineById: async (id) => {
    const response = await apiFetch(`/products/${id}`);
    return { data: await parseResponse(response) };
  },
  
  // Search medicines
  searchMedicines: async (query, params = {}) => {
    const searchParams = { ...params, search: query };
    const queryString = new URLSearchParams(searchParams).toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
  
  // Compare medicines (get multiple products)
  compareMedicines: async (medicineIds) => {
    const promises = medicineIds.map(id => medicineAPI.getMedicineById(id));
    return Promise.all(promises);
  },
  
  // Get medicine salts
  getMedicineSalts: async (id) => {
    const response = await apiFetch(`/salts/?product_id=${id}`);
    return { data: await parseResponse(response) };
  },
  
  
  // Get alternative medicines based on category, generic name, or similar uses
  getAlternativeMedicines: async (medicineId, params = {}) => {
    const searchParams = { ...params, exclude_id: medicineId };
    const queryString = new URLSearchParams(searchParams).toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
  
  // Search medicines by category
  searchByCategory: async (category) => {
    const params = { category: category, per_page: 100 };
    const queryString = new URLSearchParams(params).toString();
    const response = await apiFetch(`/products/?${queryString}`);
    return { data: await parseResponse(response) };
  },
  
  // Search medicines by generic name
  searchByGeneric: async (genericName) => {
    const params = { generic_name: genericName, per_page: 100 };
    const queryString = new URLSearchParams(params).toString();
    const response = await apiFetch(`/products/?${queryString}`);
    return { data: await parseResponse(response) };
  },
  
  // Get medicine reviews
  getMedicineReviews: async (medicineId) => {
    const response = await apiFetch(`/reviews/?product_id=${medicineId}`);
    return { data: await parseResponse(response) };
  },
  
  // Get review stats
  getReviewStats: async (medicineId) => {
    const response = await apiFetch(`/reviews/stats/${medicineId}`);
    return { data: await parseResponse(response) };
  },

  // Get all reviews (for showing recent reviews across all products)
  getAllReviews: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/reviews/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
};

// Reviews API endpoints
export const reviewsAPI = {
  // Get all reviews with filtering
  getAllReviews: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/reviews/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
  
  // Get review by ID
  getReviewById: async (id) => {
    const response = await apiFetch(`/reviews/${id}`);
    return { data: await parseResponse(response) };
  },
  
  // Get review statistics for a product
  getReviewStats: async (productId) => {
    const response = await apiFetch(`/reviews/stats/${productId}`);
    return { data: await parseResponse(response) };
  },
};

// Salts API endpoints
export const saltsAPI = {
  // Get all salts with filtering
  getAllSalts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/salts/${queryString ? `?${queryString}` : ''}`;
    const response = await apiFetch(endpoint);
    return { data: await parseResponse(response) };
  },
  
  // Get salt by ID
  getSaltById: async (id) => {
    const response = await apiFetch(`/salts/${id}`);
    return { data: await parseResponse(response) };
  },
};

// User API endpoints
export const userAPI = {
  // User login
  login: async (credentials) => {
    const response = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return { data: await parseResponse(response) };
  },
  
  // User registration
  register: async (userData) => {
    const response = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return { data: await parseResponse(response) };
  },
};

// Configuration API endpoints
export const configAPI = {
  // Get all app configuration
  getAllConfig: async () => {
    const response = await apiFetch('/config/');
    return { data: await parseResponse(response) };
  },
  
  // Get specific configuration by key
  getConfig: async (key) => {
    const response = await apiFetch(`/config/${key}`);
    return { data: await parseResponse(response) };
  },
  
  // Get configurations by category (prefix)
  getConfigByCategory: async (category) => {
    const response = await apiFetch(`/config/by-category/${category}`);
    return { data: await parseResponse(response) };
  },
};

// Data transformation utilities for Flask API compatibility
export const dataTransformUtils = {
  // Transform Flask product data to frontend model
  transformProductFromBackend: (product) => {
    if (!product) return null;
    
    // Calculate realistic pricing with discounts
    const basePrice = parseFloat(product.price) || 0;
    // Add realistic discount based on price range
    let discount = 0;
    if (basePrice > 80) {
      discount = 20; // 20% off for expensive medicines
    } else if (basePrice > 50) {
      discount = 15; // 15% off for mid-range
    } else if (basePrice > 30) {
      discount = 10; // 10% off for lower range
    } else {
      discount = 5; // 5% off for cheapest
    }
    
    const discountedPrice = Math.round(basePrice * (1 - discount / 100));
    
    return {
      id: product.id,
      name: product.name,
      genericName: product.generic_name || product.name,
      manufacturer: product.brand,
      brand: product.brand,
      price: basePrice,
      discountedPrice: Math.round(discountedPrice),
      discount: discount,
      rating: product.avg_rating,
      reviewCount: (product.reviews && product.reviews.length) || 0,
      description: product.description,
      dosage: product.dosage,
      packSize: product.pack_size,
      prescription: product.prescription_required ? 'Prescription required' : 'No prescription required',
      prescriptionRequired: product.prescription_required,
      sideEffects: Array.isArray(product.side_effects) ? product.side_effects : (product.side_effects ? JSON.parse(product.side_effects) : []),
      uses: Array.isArray(product.uses) ? product.uses : (product.uses ? JSON.parse(product.uses) : []),
      howItWorks: product.how_it_works,
      faqContent: Array.isArray(product.faq_content) ? product.faq_content : (product.faq_content ? JSON.parse(product.faq_content) : []),
      image: product.image_url || null,
      imageUrl: product.image_url || null,
      chemicalFormula: product.chemical_form,
      chemicalForm: product.chemical_form,
      availability: product.availability,
      category: product.category,
      createdAt: product.created_at,
      // Additional database fields
      salts: product.salts,
      reviews: product.reviews
    };
  },
  
  // Transform frontend product data for backend
  transformProductForBackend: (product) => {
    return {
      name: product.name,
      brand: product.manufacturer || product.brand,
      price: product.price,
      chemical_form: product.chemicalFormula || product.chemicalForm,
      image_url: product.image || product.imageUrl,
      generic_name: product.genericName,
      category: product.category,
      description: product.description,
      dosage: product.dosage,
      pack_size: product.packSize,
      prescription_required: product.prescriptionRequired,
      uses: product.uses,
      side_effects: product.sideEffects,
      how_it_works: product.howItWorks,
      faq_content: product.faqContent
    };
  },
  
  // Transform paginated response
  transformPaginatedResponse: (response) => {
    const data = response.data;
    return {
      products: (data.products || data || []).map(dataTransformUtils.transformProductFromBackend),
      pagination: {
        total: data.total,
        pages: data.pages,
        currentPage: data.current_page,
        perPage: data.per_page,
        hasNext: data.has_next,
        hasPrev: data.has_prev
      }
    };
  }
};

export default { medicineAPI, reviewsAPI, saltsAPI, userAPI, configAPI, dataTransformUtils };