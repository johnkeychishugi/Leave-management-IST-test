"use client"

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiCalendar, FiClock, FiUser, FiSettings, FiArrowRight } from 'react-icons/fi'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check authentication in useEffect to avoid hydration errors
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    } else {
      setIsLoading(false)
    }
  }, [router])
  
  // Show nothing while checking auth status to prevent flashing content
  if (isLoading) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="w-full py-4 px-6 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            IST Leave Management System
          </h1>
          <div>
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center group"
            >
              Sign In
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-1 flex-col px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Streamline</span> Leave Management for Your Organization
            </h2>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              A comprehensive solution for managing employee leaves with easy application, 
              approval workflow, and reporting features.
            </p>
            <div className="mt-10 flex gap-4">
              <Link 
                href="/login" 
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center group"
              >
                Get Started
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link 
                href="/register" 
                className="px-8 py-3.5 rounded-full border border-purple-300 text-purple-700 font-medium hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md h-80">
              <Image 
                src="/images/hero-illustration.svg" 
                alt="Leave Management Illustration" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Key Features</h3>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard 
            icon={<FiCalendar className="h-8 w-8" />}
            title="Leave Calendar"
            description="View team calendars and plan your leaves accordingly."
          />
          <FeatureCard 
            icon={<FiClock className="h-8 w-8" />}
            title="Auto-accrual"
            description="Automatic monthly leave accrual based on company policy."
          />
          <FeatureCard 
            icon={<FiUser className="h-8 w-8" />}
            title="Self-service"
            description="Apply for leaves, check balances, and track requests."
          />
          <FeatureCard 
            icon={<FiSettings className="h-8 w-8" />}
            title="Customizable"
            description="Configure leave types and approval workflows."
          />
        </div>
      </div>
      
      <footer className="w-full bg-white/80 backdrop-blur-md py-6 border-t border-purple-100 mt-auto">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© {new Date().getFullYear()} IST. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
      <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-4 text-purple-600 group-hover:text-pink-600 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 my-3 transition-all duration-300 group-hover:w-16"></div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
} 