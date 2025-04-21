'use client';

import { useState } from 'react';
import { FaMicrosoft } from 'react-icons/fa';
import { useMicrosoftAuth } from '../../lib/msal/MsalProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../lib/api/auth';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications } from '@/lib/context/NotificationContext';

interface MicrosoftLoginButtonProps {
  className?: string;
}

export default function MicrosoftLoginButton({ className = '' }: MicrosoftLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isInitialized } = useMicrosoftAuth();
  const router = useRouter();
  const { isLoading: isLoadingData, refreshUser } = useAuth();
  const { fetchNotifications } = useNotifications();

  const handleMicrosoftLogin = async () => {
    if (!isInitialized) {
      toast.error('Authentication service is still initializing. Please try again in a moment.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Authenticate with Microsoft
      console.log("Starting Microsoft authentication flow...");
      const response = await login();
      console.log("Microsoft authentication successful:", response);
      
      if (!response || !response.account) {
        throw new Error("Failed to retrieve user account information");
      }
      
      // Step 2: Extract user information from Microsoft response
      const userEmail = response.account.username;
      const firstName = response.account.name?.split(' ')[0] || '';
      const lastName = response.account.name?.split(' ').slice(1).join(' ') || '';
      
      toast.success('Microsoft sign-in successful, authenticating with system...');
      
      // Step 3: Get profile picture if available
      let profilePictureUrl: string | undefined;
      try {
        if (response.accessToken) {
          const graphEndpoint = `https://graph.microsoft.com/v1.0/me/photo/$value`;
          console.log("Fetching profile picture from Graph API...");
          const photoResponse = await fetch(graphEndpoint, {
            headers: {
              'Authorization': `Bearer ${response.accessToken}`
            }
          });
          
          if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            profilePictureUrl = URL.createObjectURL(blob);
            console.log("Profile picture retrieved successfully");
          } else {
            console.warn('Could not fetch profile picture. Status:', photoResponse.status);
          }
        }
      } catch (photoError) {
        console.warn('Could not fetch profile picture:', photoError);
      }
      
      // Step 4: Authenticate with our backend
      console.log("Authenticating with backend using Microsoft credentials...");
      const authResponse = await AuthService.microsoftAuth({
        firstName,
        lastName,
        email: userEmail,
        token: response.accessToken || '',
        profilePictureUrl
      });
      
      console.log("Backend authentication successful:", authResponse);
      
      // Refresh the user data in AuthContext
      await refreshUser();
      
      // Refresh notifications immediately after login
      await fetchNotifications();
      
      toast.success('Login successful! Redirecting to dashboard...');
      
      // Step 5: Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      
      // Enhanced error handling for debugging
      const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
      console.error('Error details:', errorStr);
      
      // Handle different types of errors
      if (error instanceof Error) {
        const errorMessage = error.message || 'Authentication failed';
        
        // Specific error handling for hash_empty_error
        if (errorMessage.includes('hash_empty_error')) {
          toast.error('Authentication flow interrupted. Please ensure pop-ups are allowed in your browser and try again.');
          console.error('MSAL hash_empty_error: This usually indicates that the authentication redirect flow was interrupted.');
        } 
        // Check for domain restriction errors
        else if (errorMessage.includes('domain') || errorMessage.includes('email addresses are allowed')) {
          toast.error('Your email domain is not allowed in production. Please use a company email address.');
        } else {
          // If it's a standard error with a message
          toast.error(errorMessage);
        }
      } else if (typeof error === 'object' && error !== null) {
        // If it's an object with error details
        const errorObj = error as any;
        const errorMessage = errorObj.message || errorObj.error_description || 'Authentication failed';
        
        // Check for specific MSAL errors
        if (errorMessage.includes('hash_empty_error')) {
          toast.error('Authentication flow interrupted. Please ensure pop-ups are allowed in your browser and try again.');
        }
        // Check for domain restriction errors in the message
        else if (errorMessage.includes('domain') || errorMessage.includes('email addresses are allowed')) {
          toast.error('Your email domain is not allowed in production. Please use a company email address.');
        } else {
          toast.error(errorMessage);
        }
      } else {
        // Generic error message
        toast.error('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMicrosoftLogin}
      disabled={isLoading || !isInitialized}
      className={`w-full flex justify-center items-center px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-200 ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <FaMicrosoft className="h-5 w-5 mr-2" />
          Sign in with Microsoft
        </>
      )}
    </button>
  );
} 