import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [dealer, setDealer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dealerToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // In a real app, you'd fetch the profile to verify the token here
      // For now, if we have a token, we assume logged in.
      // Alternatively, parse dealer info from localStorage
      const savedDealer = localStorage.getItem('dealerData');
      if (savedDealer) {
        setDealer(JSON.parse(savedDealer));
      }
    }
    setLoading(false);
  }, [token]);

  const sendLoginOtp = async (phone) => {
    try {
      const res = await axios.post(`${API_BASE}/dealer/send-login-otp`, { phone });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const login = async (phone, otp) => {
    try {
      const res = await axios.post(`${API_BASE}/dealer/login`, { phone, otp });
      if (res.data.success) {
        setToken(res.data.token);
        setDealer(res.data.dealer);
        localStorage.setItem('dealerToken', res.data.token);
        localStorage.setItem('dealerData', JSON.stringify(res.data.dealer));
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setDealer(null);
    localStorage.removeItem('dealerToken');
    localStorage.removeItem('dealerData');
  };

  return (
    <AuthContext.Provider value={{ dealer, token, sendLoginOtp, login, logout, loading, authHeader: { Authorization: `Bearer ${token}` } }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
