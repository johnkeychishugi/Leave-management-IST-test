'use client';

import { useState } from 'react';
import { FaMicrosoft } from 'react-icons/fa';
import { useMicrosoftAuth } from '../../lib/msal/MsalProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../lib/api/auth';
import { useAuth } from '@/lib/context/AuthContext';

interface MicrosoftLoginButtonProps {
  className?: string;
}

export default function MicrosoftLoginButton({ className = '' }: MicrosoftLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isInitialized } = useMicrosoftAuth();
  const router = useRouter();
  const { isLoading: isLoadingData, refreshUser } = useAuth();

  const handleMicrosoftLogin = async () => {
    if (!isInitialized) {
      toast.error('Authentication service is still initializing. Please try again in a moment.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Authenticate with Microsoft
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
        const graphEndpoint = `https://graph.microsoft.com/v1.0/me/photo/$value`;
        const photoResponse = await fetch(graphEndpoint, {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`
          }
        });
        
        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          profilePictureUrl = URL.createObjectURL(blob);
        }
      } catch (photoError) {
        console.warn('Could not fetch profile picture:', photoError);
      }
      
      // Step 4: Authenticate with our backend
      const authResponse = await AuthService.microsoftAuth({
        firstName,
        lastName,
        email: userEmail,
        token: response.accessToken,
        profilePictureUrl
      });
      
      console.log("Backend authentication successful:", authResponse);
      toast.success('Login successful! Redirecting to dashboard...');

       // Refresh the user data in AuthContext
       refreshUser();
      
      // Step 5: Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        // Check for domain restriction errors
        if (error.message?.includes('domain') || error.message?.includes('email addresses are allowed')) {
          toast.error('Your email domain is not allowed in production. Please use a company email address.');
        } else {
          // If it's a standard error with a message
          toast.error(error.message || 'Authentication failed. Please try again.');
        }
      } else if (typeof error === 'object' && error !== null) {
        // If it's an object with error details
        const errorObj = error as any;
        const errorMessage = errorObj.message || errorObj.error_description || 'Authentication failed';
        
        // Check for domain restriction errors in the message
        if (errorMessage?.includes('domain') || errorMessage?.includes('email addresses are allowed')) {
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
      className={`w-full flex justify-center items-center px-4 py-2 bg-[#2F2F2F] text-white rounded-md hover:bg-[#1E1E1E] transition-colors ${className}`}
    >
      <FaMicrosoft className="h-5 w-5 mr-2" />
      <span>{isLoading ? 'Signing in...' : 'Sign in with Microsoft'}</span>
    </button>
  );
} 