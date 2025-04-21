'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, EventMessage, AuthenticationResult, PopupRequest } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './config';

// Create context to share MSAL instance
interface MsalContextType {
  msalInstance: PublicClientApplication | null;
  isInitialized: boolean;
  login: () => Promise<AuthenticationResult>;
  logout: () => void;
}

const MsalContext = createContext<MsalContextType>({
  msalInstance: null,
  isInitialized: false,
  login: async () => { throw new Error('MSAL not initialized'); },
  logout: () => {}
});

export const useMicrosoftAuth = () => useContext(MsalContext);

interface MsalProviderProps {
  children: ReactNode;
}

export const MsalProvider = ({ children }: MsalProviderProps) => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Create a single MSAL instance
    const instance = new PublicClientApplication(msalConfig);
    
    // Initialize the MSAL instance
    instance.initialize().then(() => {
      console.log("MSAL instance initialized successfully");
      
      // Handle any redirects (even though we're using popup)
      // This is important for error handling
      instance.handleRedirectPromise().catch(err => {
        console.error('Error during redirect handling:', err);
      });

      // Add event logging for debugging
      const callbackId = instance.addEventCallback((event: EventMessage) => {
        console.log("MSAL event:", event.eventType, event);
      });

      setMsalInstance(instance);
      setIsInitialized(true);
      
      return () => {
        if (callbackId) {
          instance.removeEventCallback(callbackId);
        }
      };
    }).catch(err => {
      console.error("MSAL initialization failed:", err);
    });
  }, []);

  // Login function using popup
  const login = async (): Promise<AuthenticationResult> => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL not initialized. Please wait for initialization to complete.");
    }
    
    try {
      console.log("Attempting Microsoft popup login...");
      // Make sure we're correctly configuring the popup
      const popupConfig: PopupRequest = {
        ...loginRequest,
        redirectUri: msalConfig.auth.redirectUri
      };
      return await msalInstance.loginPopup(popupConfig);
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    if (!msalInstance || !isInitialized) return;
    msalInstance.logout();
  };

  // Provide the MSAL instance and functions through context
  return (
    <MsalContext.Provider value={{ msalInstance, isInitialized, login, logout }}>
      {children}
    </MsalContext.Provider>
  );
}; 