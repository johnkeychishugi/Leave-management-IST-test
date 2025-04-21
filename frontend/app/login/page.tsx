'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/context/AuthContext';
import { AuthService } from '../../lib/api/auth';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import MicrosoftLoginButton from '@/components/auth/MicrosoftLoginButton';
import { useNotifications } from '@/lib/context/NotificationContext';
import { FiMail, FiLock, FiLogIn, FiUser } from 'react-icons/fi';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isLoading, refreshUser } = useAuth();
  const { fetchNotifications } = useNotifications();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    
    try {
      // Use the AuthService API directly
      const response: any = await AuthService.login({ 
        email, 
        password 
      });
      
      // Store the token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('firstName', response.firstName);
      localStorage.setItem('lastName', response.lastName);
      localStorage.setItem('fullName', response.fullName);
      localStorage.setItem('email', response.email);
      localStorage.setItem('roles', JSON.stringify(response.roles));

      // Refresh the user data in AuthContext
      await refreshUser();
      
      // Refresh notifications immediately after login
      await fetchNotifications();

      // Show success message
      toast.success('Login successful!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      const error = err as AxiosError<any>;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError(error.response.data && error.response.data.message ? error.response.data.message : 'Invalid email or password');
          console.log(error.response.data);
        } else if (error.response.data && error.response.data.message) {
          console.log(error.response.data.message);
          setError(error.response.data.message);
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        setError('An error occurred during login. Please try again.');
      } 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left side - Illustration and welcome message */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col items-center justify-center text-white">
          <div className="hidden md:block relative w-full h-48">
            <Image 
              src="/images/login-illustration.svg" 
              alt="Login illustration" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mt-6 text-center">Welcome Back!</h1>
          <p className="mt-4 text-center opacity-80">
            Sign in to manage your leave applications and stay updated with the latest notifications.
          </p>
          <div className="mt-8 text-center">
            <p className="mb-2 text-white/80">Don't have an account?</p>
            <Link 
              href="/register" 
              className="inline-block px-6 py-2.5 rounded-full border border-white text-white hover:bg-white hover:text-purple-500 transition-all duration-200 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="bg-white p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h2>
            <p className="text-gray-600">Access your leave management account</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiLogIn className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <MicrosoftLoginButton className="bg-gray-800 hover:bg-gray-900 rounded-lg py-3" />
            </div>
          </div>
          
          {/* Password Reset Link */}
          <div className="text-center mt-4">
            <Link href="#" className="text-sm text-purple-600 hover:text-purple-500 transition-colors relative inline-block group">
              Forgot your password?
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 