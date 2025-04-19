'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string | string[];
  profilePictureUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => void;
}

const initialState: AuthContextType = {
  user: null,
  isLoading: true,
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  refreshUser: () => {},
};

const AuthContext = createContext<AuthContextType>(initialState);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);

  // Function to load user data from localStorage
  const loadUserFromLocalStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      const email = localStorage.getItem('email');
      const rolesData = localStorage.getItem('roles');  
      const profilePictureUrl = localStorage.getItem('profilePictureUrl');
      // Parse roles safely
      let parsedRoles: string[] = [];
      if (rolesData) {
        try {
          parsedRoles = JSON.parse(rolesData);
          // Ensure parsedRoles is an array
          if (!Array.isArray(parsedRoles)) {
            parsedRoles = [];
          }
        } catch (e) {
          console.error('Error parsing roles:', e);
        }
      }
      
      setRoles(parsedRoles);
      
      if (token && userId) {
        setUser({
          id: parseInt(userId),
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          role: parsedRoles,
          profilePictureUrl: profilePictureUrl || null
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading user data:', error);
      return false;
    }
  };

  // Method to refresh user data from localStorage
  const refreshUser = () => {
    loadUserFromLocalStorage();
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      setIsLoading(true);
      loadUserFromLocalStorage();
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const logout = () => {
    // Clear auth token
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('roles');
    localStorage.removeItem('profilePictureUrl');
    
    // Reset user state
    setUser(null);
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    router.push('/login');
  };

  const hasRole = (role: string): boolean => {
    if (!roles) return false;
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        logout,
        isAuthenticated: !!user,
        hasRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 