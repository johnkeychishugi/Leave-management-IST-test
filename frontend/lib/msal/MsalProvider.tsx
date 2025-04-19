'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider as MsalReactProvider } from '@azure/msal-react';
import { msalConfig, isAllowedDomain, getProfilePictureUrl, loginRequest } from './config';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface MsalProviderProps {
  children: ReactNode;
}

export const MsalProvider = ({ children }: MsalProviderProps) => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const instance = new PublicClientApplication(msalConfig);
    
    // Initialize the MSAL instance first
    instance.initialize().then(() => {
      // Handle redirect promise after initialization (for redirect flow only, not used in our popup flow)
      instance.handleRedirectPromise().catch(err => {
        console.error('Error during redirect handling:', err);
      });

      // Note: We're not processing login success here anymore as it's handled in MicrosoftLoginButton
      // We'll just log events for debugging
      const callbackId = instance.addEventCallback((event: EventMessage) => {
        console.log("MSAL event:", event.eventType);
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
  }, [router]);

  if (!msalInstance || !isInitialized) {
    return null; // Or a loading indicator
  }

  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
};

// Export the login and logout functions for use in components
export const useMicrosoftAuth = () => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const instance = new PublicClientApplication(msalConfig);
    
    // Initialize the MSAL instance
    instance.initialize().then(() => {
      setMsalInstance(instance);
      setIsInitialized(true);
      console.log("MSAL instance initialized successfully");
    }).catch(err => {
      console.error("MSAL initialization failed:", err);
    });
    
    return () => {
      // Any cleanup if needed
    };
  }, []);
  
  const login = async () => {
    if (!msalInstance || !isInitialized) {
      throw new Error("MSAL not initialized. Please wait for initialization to complete.");
    }
    
    try {
      console.log("Attempting Microsoft popup login...");
      return await msalInstance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      throw error;
    }
  };
  
  const logout = () => {
    if (!msalInstance || !isInitialized) return;
    msalInstance.logout();
  };
  
  return { login, logout, isInitialized };
}; 