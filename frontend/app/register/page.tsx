'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '../../lib/api/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../../lib/api/types';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.register({
        firstName,
        lastName,
        email,
        password
      });
      
      // Show success message and redirect to login
      toast.success(response.message || 'Registration successful! Please login.');
      router.push('/login');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      const error = err as AxiosError<ApiError>;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left side - Illustration and welcome message */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col items-center justify-center text-white order-2 md:order-1">
          <div className="hidden md:block relative w-full h-48">
            <Image 
              src="/images/register-illustration.svg" 
              alt="Register illustration" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mt-6 text-center">Join Us Today!</h1>
          <p className="mt-4 text-center opacity-80">
            Create an account to manage your leave applications and enjoy all the features of our leave management system.
          </p>
          <div className="mt-8 text-center">
            <p className="mb-2 text-white/80">Already have an account?</p>
            <Link 
              href="/login" 
              className="inline-block px-6 py-2.5 rounded-full border border-white text-white hover:bg-white hover:text-purple-500 transition-all duration-200 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        {/* Right side - Register form */}
        <div className="bg-white p-8 flex flex-col justify-center order-1 md:order-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
            <p className="text-gray-600">Start managing your leaves efficiently</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                </div>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                </div>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
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
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
              </div>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div className="pt-2">
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-600 group">
              <span className="group-hover:text-gray-800 transition-colors duration-300">By creating an account, you agree to our</span> 
              <Link href="#" className="text-purple-600 hover:text-purple-500 ml-1 relative inline-block">
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link> and 
              <Link href="#" className="text-purple-600 hover:text-purple-500 ml-1 relative inline-block">
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 