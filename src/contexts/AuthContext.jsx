import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (!tokenFromStorage) {
      setLoadingAuth(false);
      return;
    }

    // Try to initialize user from localStorage as a fallback (helps when backend CORS blocks /auth/me)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
        setToken(tokenFromStorage);
        setLoadingAuth(false); // render quickly using cached auth until restore completes
      } catch (e) {
        // ignore parse errors
      }
    }

    const restoreUser = async () => {
      try {
        const userRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${tokenFromStorage}` }
        });
        setToken(tokenFromStorage);
        setUser(userRes.data);
        localStorage.setItem('user', JSON.stringify(userRes.data));
      } catch (err) {
        console.error('Auth restore failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams({
        username: email,
        password,
      });

      const res = await api.post('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);

      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });
      setUser(userRes.data);
      localStorage.setItem('user', JSON.stringify(userRes.data));
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loadingAuth) {
    return null;
  }

  return <AuthContext.Provider value={{ user, token, loading: loadingAuth, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
