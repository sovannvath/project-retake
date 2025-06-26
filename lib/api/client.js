// API Client for Laravel Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://laravel-wtc.onrender.com/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = null;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  getToken() {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  async makeRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (requiresAuth && this.getToken()) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
      }

      const options = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return {
        status: response.status,
        data: responseData,
        success: true,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 500,
        data: { message: error.message },
        success: false,
        error: error.message,
      };
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.makeRequest('/register', 'POST', userData, false);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.makeRequest('/login', 'POST', credentials, false);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    const response = await this.makeRequest('/logout', 'POST');
    if (response.success) {
      this.setToken(null);
    }
    return response;
  }

  async getUserInfo() {
    return this.makeRequest('/user', 'GET');
  }

  // Product methods
  async getProducts() {
    return this.makeRequest('/products', 'GET', null, false);
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`, 'GET', null, false);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', 'POST', productData);
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/products/${id}`, 'PUT', productData);
  }

  async deleteProduct(id) {
    return this.makeRequest(`/products/${id}`, 'DELETE');
  }

  async getLowStockProducts() {
    return this.makeRequest('/products/low-stock', 'GET');
  }

  // Cart methods
  async getCart() {
    return this.makeRequest('/cart', 'GET');
  }

  async addToCart(productId, quantity) {
    return this.makeRequest('/cart/add', 'POST', { product_id: productId, quantity });
  }

  async updateCartItem(itemId, quantity) {
    return this.makeRequest(`/cart/items/${itemId}`, 'PUT', { quantity });
  }

  async removeCartItem(itemId) {
    return this.makeRequest(`/cart/items/${itemId}`, 'DELETE');
  }

  async clearCart() {
    return this.makeRequest('/cart/clear', 'DELETE');
  }

  // Order methods
  async getOrders() {
    return this.makeRequest('/orders', 'GET');
  }

  async getOrder(id) {
    return this.makeRequest(`/orders/${id}`, 'GET');
  }

  async createOrder(orderData) {
    return this.makeRequest('/orders', 'POST', orderData);
  }

  async getPaymentMethods() {
    return this.makeRequest('/payment-methods', 'GET');
  }

  async updateOrderStatus(id, status) {
    return this.makeRequest(`/orders/${id}/status`, 'PUT', { order_status: status });
  }

  async updatePaymentStatus(id, status) {
    return this.makeRequest(`/orders/${id}/payment`, 'PUT', { payment_status: status });
  }

  // Request Order methods
  async getRequestOrders() {
    return this.makeRequest('/request-orders', 'GET');
  }

  async getRequestOrder(id) {
    return this.makeRequest(`/request-orders/${id}`, 'GET');
  }

  async createRequestOrder(requestData) {
    return this.makeRequest('/request-orders', 'POST', requestData);
  }

  async adminApproval(id, approvalData) {
    return this.makeRequest(`/request-orders/${id}/admin-approval`, 'PUT', approvalData);
  }

  async warehouseApproval(id, approvalData) {
    return this.makeRequest(`/request-orders/${id}/warehouse-approval`, 'PUT', approvalData);
  }

  // Notification methods
  async getNotifications() {
    return this.makeRequest('/notifications', 'GET');
  }

  async getUnreadNotifications() {
    return this.makeRequest('/notifications/unread', 'GET');
  }

  async markNotificationAsRead(id) {
    return this.makeRequest(`/notifications/${id}/read`, 'PUT');
  }

  async markAllNotificationsAsRead() {
    return this.makeRequest('/notifications/read-all', 'PUT');
  }

  async deleteNotification(id) {
    return this.makeRequest(`/notifications/${id}`, 'DELETE');
  }

  // Dashboard methods
  async getCustomerDashboard() {
    return this.makeRequest('/dashboard/customer', 'GET');
  }

  async getAdminDashboard() {
    return this.makeRequest('/dashboard/admin', 'GET');
  }

  async getWarehouseDashboard() {
    return this.makeRequest('/dashboard/warehouse', 'GET');
  }

  async getStaffDashboard() {
    return this.makeRequest('/dashboard/staff', 'GET');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

