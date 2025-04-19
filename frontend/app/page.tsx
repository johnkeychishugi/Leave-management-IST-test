"use client"

import Link from "next/link"
import { redirect } from 'next/navigation'
import { FiCalendar, FiClock, FiUser, FiSettings } from 'react-icons/fi'

export default function Home() {
   //token in local storage
   const token = localStorage.getItem('token')

   if(token){
    redirect('/dashboard')
   }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary-700">IST Leave Management System</h1>
          <div>
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-1 flex-col items-center justify-center py-12 px-4">
        <div className="max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Streamline Leave Management for Your Organization
          </h2>
          <p className="mt-6 text-xl text-gray-600">
            A comprehensive solution for managing employee leaves with easy application, 
            approval workflow, and reporting features.
          </p>
          <div className="mt-10">
            <Link href="/login" className="btn btn-primary px-8 py-3 text-base">
              Get Started
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
      
      <footer className="w-full bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
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
    <div className="card flex flex-col items-center text-center">
      <div className="rounded-full bg-primary-100 p-3 text-primary-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
} 