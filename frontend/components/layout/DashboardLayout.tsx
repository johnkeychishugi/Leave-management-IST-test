'use client';

import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiCalendar, 
  FiPlusCircle, 
  FiUsers, 
  FiBriefcase,
  FiList,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiBell,
  FiChevronDown,
  FiDollarSign,
  FiCheck,
  FiRefreshCw,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../lib/context/AuthContext';
import { toast } from 'react-hot-toast';
import NotificationBell from '../common/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, hasRole } = useAuth();
  
  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'My Leaves', href: '/dashboard/my-leaves', icon: FiCalendar },
    { name: 'Apply Leave', href: '/dashboard/apply-leave', icon: FiPlusCircle },
    { name: 'Leave Balances', href: '/dashboard/leave-balances', icon: FiDollarSign },
    { name: 'Pending Approvals', href: '/dashboard/pending-approvals', icon: FiCheck, roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    { name: 'All Leaves', href: '/dashboard/admin/all-leaves', icon: FiCalendar, roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    { name: 'Users', href: '/dashboard/users', icon: FiUsers, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    { name: 'Departments', href: '/dashboard/departments', icon: FiBriefcase, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    { name: 'Leave Types', href: '/dashboard/leave-types', icon: FiList, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    { name: 'Manage Leave Balances', href: '/dashboard/admin/leave-balances', icon: FiDollarSign, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    { name: 'My Profile', href: '/dashboard/profile', icon: FiUser },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ];
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('roles');
    localStorage.removeItem('profilePictureUrl');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    router.push('/login');
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-indigo-800 text-white h-full transition-all duration-300 ease-in-out z-10
                   ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}
      >
        {/* Logo and toggle */}
        <div className="h-20 flex items-center px-4">
          <h1 className={`font-bold text-2xl transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            LMS
          </h1>
          <button 
            onClick={toggleSidebar}
            className={`text-white p-2 rounded-md hover:bg-indigo-700 ${isSidebarOpen ? 'ml-auto' : 'mx-auto'}`}
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
        
        {/* Navigation links */}
        <div className="flex-grow overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            // Skip rendering if item has role restrictions and user doesn't have the required role
            if (item.roles && item.roles.length > 0) {
              if (!item.roles.some(role => hasRole(role))) {
                return null;
              }
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center py-3 px-4 transition-colors duration-200
                          ${isActive 
                            ? 'bg-indigo-700 border-l-4 border-white' 
                            : 'hover:bg-indigo-700'
                          }`}
              >
                <item.icon size={20} />
                <span 
                  className={`ml-3 transition-opacity duration-200 
                             ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Sign out button */}
        <div className="mt-auto mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center py-3 px-4 w-full transition-colors duration-200 hover:bg-indigo-700"
          >
            <FiLogOut size={20} />
            <span 
              className={`ml-3 transition-opacity duration-200 
                         ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <div className="text-gray-600">
            <span className="font-medium">Welcome, {user?.firstName || 'User'}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />
            
            {/* User dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={toggleUserMenu}
              >
                <div className="bg-indigo-100 p-2 rounded-full">
                  {
                    user?.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt="Profile" className="w-6 h-6 rounded-full" />
                    ) : (
                      <FiUser className="text-indigo-600" size={18} />
                    )
                  }
                </div>
                <span className="hidden md:inline-block">{user?.firstName} {user?.lastName}</span>
                <FiChevronDown size={16} className={`transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs font-medium text-indigo-600 mt-1">{user?.role}</p>
                  </div>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 