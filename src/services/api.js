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
  
  // Get medicine descriptions
  getMedicineDescriptions: async (id) => {
    const response = await apiFetch(`/description/?product_id=${id}`);
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
    const params = { category: category, per_page: 20 };
    const queryString = new URLSearchParams(params).toString();
    const response = await apiFetch(`/products/?${queryString}`);
    return { data: await parseResponse(response) };
  },
  
  // Search medicines by generic name
  searchByGeneric: async (genericName) => {
    const params = { generic_name: genericName, per_page: 20 };
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

// Data transformation utilities for Flask API compatibility
export const dataTransformUtils = {
  // Transform Flask product data to frontend model
  transformProductFromBackend: (product) => {
    if (!product) return null;
    
    // Use exact database pricing without modification
    const basePrice = parseFloat(product.price) || 100;
    const discount = 0; // No random discount - use exact database price
    const discountedPrice = basePrice; // Same as base price
    
    return {
      id: product.id,
      name: product.name || 'Unknown Medicine',
      genericName: product.generic_name || product.name || 'Generic',
      manufacturer: product.brand || 'Generic Pharma',
      brand: product.brand || 'Generic Pharma',
      price: basePrice,
      discountedPrice: Math.round(discountedPrice),
      discount: discount,
      rating: product.avg_rating || (3.5 + Math.random() * 1.5),
      reviewCount: (product.reviews && product.reviews.length) || Math.floor(Math.random() * 50) + 10,
      description: product.description || `${product.name} is a medicine used for various therapeutic purposes.`,
      dosage: product.dosage || 'Standard dosage',
      packSize: product.pack_size || '15 tablets',
      prescription: product.prescription_required ? 'Prescription required' : 'No prescription required',
      prescriptionRequired: product.prescription_required || false,
      sideEffects: Array.isArray(product.side_effects) ? product.side_effects : (product.side_effects ? JSON.parse(product.side_effects) : ['Consult your doctor for side effects']),
      uses: Array.isArray(product.uses) ? product.uses : (product.uses ? JSON.parse(product.uses) : ['General health support']),
      howItWorks: product.how_it_works || 'Consult your healthcare provider for detailed mechanism of action.',
      faqContent: Array.isArray(product.faq_content) ? product.faq_content : (product.faq_content ? JSON.parse(product.faq_content) : []),
      image: product.image_url || `https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop`,
      imageUrl: product.image_url || `https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop`,
      chemicalFormula: product.chemical_form || dataTransformUtils.generateChemicalFormula(product.name),
      chemicalForm: product.chemical_form || dataTransformUtils.generateChemicalFormula(product.name),
      availability: Math.random() > 0.2 ? 'In Stock' : 'Limited Stock',
      category: product.category || 'General Medicine',
      createdAt: product.created_at,
      // Additional database fields
      salts: product.salts || [],
      reviews: product.reviews || [],
      descriptions: product.descriptions || []
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
  
  // Generate consistent chemical formula
  generateChemicalFormula: (medicineName) => {
    if (!medicineName) return 'C8H9NO2';
    const formulas = [
      'C8H9NO2', 'C17H19NO3', 'C14H18N2O', 'C13H16ClNO',
      'C22H29FO5', 'C16H16ClNO2', 'C15H17NO2', 'C9H13NO3'
    ];
    const hash = medicineName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return formulas[Math.abs(hash) % formulas.length];
  },
  
  // Transform paginated response
  transformPaginatedResponse: (response) => {
    const data = response.data;
    return {
      products: (data.products || data || []).map(dataTransformUtils.transformProductFromBackend),
      pagination: {
        total: data.total || 0,
        pages: data.pages || 1,
        currentPage: data.current_page || 1,
        perPage: data.per_page || 20,
        hasNext: data.has_next || false,
        hasPrev: data.has_prev || false
      }
    };
  }
};

export default { medicineAPI, reviewsAPI, saltsAPI, userAPI, dataTransformUtils };