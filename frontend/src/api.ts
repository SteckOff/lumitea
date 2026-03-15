// Lumi Tea - Frontend API Service
const API_URL = import.meta.env.VITE_API_URL || 'https://lumitea.kr/api';

// Helper function for API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    // Send verification code
    sendVerification: (email: string) => {
        return fetchAPI('/auth/send-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Verify code and register
    verifyAndRegister: (email: string, code: string, password: string, name: string) => {
        return fetchAPI('/auth/verify-and-register', {
            method: 'POST',
            body: JSON.stringify({ email, code, password, name }),
        });
    },

    // Login
    login: (email: string, password: string) => {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // Get current user
    getMe: () => {
        return fetchAPI('/auth/me');
    },
};

// Products API
export const productsAPI = {
    // Get all products
    getAll: () => {
        return fetchAPI('/products');
    },

    // Get single product
    getById: (id: string) => {
        return fetchAPI(`/products/${id}`);
    },

    // Create product (admin only)
    create: (product: any) => {
        return fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    },

    // Update product (admin only)
    update: (id: string, updates: any) => {
        return fetchAPI(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    // Delete product (admin only)
    delete: (id: string) => {
        return fetchAPI(`/products/${id}`, {
            method: 'DELETE',
        });
    },
};

// Orders API
export const ordersAPI = {
    // Get user orders
    getMyOrders: () => {
        return fetchAPI('/orders');
    },

    // Create order
    create: (order: any) => {
        return fetchAPI('/orders', {
            method: 'POST',
            body: JSON.stringify(order),
        });
    },
};

// Admin API
export const adminAPI = {
    // Get all users
    getUsers: () => {
        return fetchAPI('/admin/users');
    },

    // Update user role
    updateUserRole: (id: string, role: string) => {
        return fetchAPI(`/admin/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    },

    // Delete user
    deleteUser: (id: string) => {
        return fetchAPI(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    },

    // Get all orders
    getAllOrders: () => {
        return fetchAPI('/admin/orders');
    },

    // Update order status
    updateOrderStatus: (id: string, status: string) => {
        return fetchAPI(`/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
};

// Health check
export const healthAPI = {
    check: () => {
        return fetchAPI('/health');
    },
};

export default {
    auth: authAPI,
    products: productsAPI,
    orders: ordersAPI,
    admin: adminAPI,
    health: healthAPI,
};
