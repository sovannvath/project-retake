import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../api/client';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const response = await apiClient.getUserInfo();
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data,
                token: token,
              },
            });
          } else {
            // Token is invalid, remove it
            apiClient.setToken(null);
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          apiClient.setToken(null);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.login(credentials);
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.data.message || 'Login failed',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.register(userData);
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.data.message || 'Registration failed',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Get user role
  const getUserRole = () => {
    if (!state.user) return null;
    return state.user.role || 'customer';
  };

  // Check if user has specific role
  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is staff
  const isStaff = () => hasRole('staff');

  // Check if user is warehouse manager
  const isWarehouseManager = () => hasRole('warehouse');

  // Check if user is customer
  const isCustomer = () => hasRole('customer');

  const value = {
    ...state,
    login,
    register,
    logout,
    getUserRole,
    hasRole,
    isAdmin,
    isStaff,
    isWarehouseManager,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

