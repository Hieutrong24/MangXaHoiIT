import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { tokenStorage } from '../services/tokenStorage';
import { useNavigate } from 'react-router-dom';
import { safeReadStoredUser } from '../shared/utils/currentUser';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const logout = () => {
    tokenStorage.clear();
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('uid'); 
    localStorage.removeItem('currentUserId');
    // Trigger window event để các component khác listen
    window.dispatchEvent(new Event('authLogout'));
};

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({ name: "", email: "" });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(() => {
        const token = tokenStorage.get();
        const user = safeReadStoredUser();
        const hasValidState = !!(token && user);
        setIsAuthenticated(hasValidState);
        if (hasValidState) {
            setAuthState({ name: user.fullName || user.name || '', email: user.email || '' });
        }
        return hasValidState;
    }, []);

    useEffect(() => {
        checkAuth();
        setLoading(false);
    }, [checkAuth]);

    // Watch localStorage token changes (từ interceptor clear)
    useEffect(() => {
        const handleStorageChange = () => checkAuth();
        const handleLogoutEvent = () => {
            setIsAuthenticated(false);
            setAuthState({ name: "", email: "" });
            navigate('/auth/login', { replace: true });
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authLogout', handleLogoutEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authLogout', handleLogoutEvent);
        };
    }, [checkAuth, navigate]);

    const value = {
        authState, 
        setAuthState,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        checkAuth,
        login: (userData) => {
            setAuthState({ name: userData.name || userData.fullName || '', email: userData.email || '' });
            setIsAuthenticated(true);
        },
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
