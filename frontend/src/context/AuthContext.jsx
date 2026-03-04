import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('bs_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('bs_token') || null);

    const login = useCallback(async (username, password) => {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Login failed');
        localStorage.setItem('bs_token', data.token);
        localStorage.setItem('bs_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('bs_token');
        localStorage.removeItem('bs_user');
        setToken(null);
        setUser(null);
    }, []);

    // Helper to build auth headers for every API call
    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }), [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, authHeaders }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
