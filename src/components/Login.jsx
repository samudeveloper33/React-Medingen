import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './Login.css';

const Login = ({ onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await userAPI.login(formData);
        const userData = response.data;
        
        // Backend returns token, user_id, and username directly
        login({
          access_token: userData.token,
          username: userData.username,
          user_id: userData.user_id
        });
        
        onClose && onClose();
      } else {
        // Registration
        const response = await userAPI.register(formData);
        const userData = response.data;
        
        // Backend returns token, user_id, and username directly
        login({
          access_token: userData.token,
          username: userData.username,
          user_id: userData.user_id
        });
        
        onClose && onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="login-modal__backdrop" onClick={onClose}></div>
      <div className="login-modal__content">
        <div className="login-form">
          <h2 className="login-form__title">
            {isLogin ? 'Login to Medingen' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="login-form__error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form__group">
              <label className="login-form__label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="login-form__input"
                required
              />
            </div>

            <div className="login-form__group">
              <label className="login-form__label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-form__input"
                required
                minLength={isLogin ? 1 : 6}
              />
              {!isLogin && (
                <small className="login-form__hint">
                  Password must be at least 6 characters long
                </small>
              )}
            </div>

            <button 
              type="submit" 
              className="login-form__submit"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="login-form__switch">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    resetForm();
                  }}
                  className="login-form__switch-btn"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    resetForm();
                  }}
                  className="login-form__switch-btn"
                >
                  Login here
                </button>
              </p>
            )}
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="login-form__close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
