import { createContext, useState } from "react";

export const AuthContext = createContext();

const readUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(readUser());

    const login = (jwt, userData) => {

        localStorage.setItem("token", jwt);

        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        }

        setToken(jwt);

    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}
