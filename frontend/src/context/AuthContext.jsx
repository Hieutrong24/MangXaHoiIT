import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({ name: "", email: "" });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <AuthContext.Provider
            value={{ authState, setAuthState, isAuthenticated, setIsAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
