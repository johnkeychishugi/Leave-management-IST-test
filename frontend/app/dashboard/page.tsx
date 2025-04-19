'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LeaveApplicationService, LeaveBalanceService, LeaveStatus } from '@/lib/api';
import { FiCalendar, FiCheck, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/context/AuthContext';
const StatCard = ({ title, value, icon: Icon, className }: any) => (
  <div className={`rounded-lg shadow-md p-6 ${className}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-white bg-opacity-30">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="ml-5">
        <p className="text-white text-sm font-medium uppercase">{title}</p>
        <p className="text-white text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentYear = new Date().getFullYear();
  const queryClient = useQueryClient();

  // Simulate getting user ID from session
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUserId(parseInt(userId));
    }
  }, []);

  // Get leave balances
  const { data: leaveBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ['leaveBalances', userId, currentYear],
    queryFn: () => userId 
      ? LeaveBalanceService.getLeaveBalancesByUserIdAndYear(userId, currentYear)
      : Promise.resolve([]),
    enabled: !!userId
  });

  // Get leave applications
  const { data: leaveApplications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['leaveApplications', userId],
    queryFn: () => userId 
      ? LeaveApplicationService.getLeaveApplicationsByUserId(userId)
      : Promise.resolve([]),
    enabled: !!userId
  });

  // Function to refresh dashboard data
  const refreshDashboardData = async () => {
    if (!userId) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['leaveBalances', userId, currentYear] }),
        queryClient.invalidateQueries({ queryKey: ['leaveApplications', userId] })
      ]);
      toast.success('Dashboard data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      toast.error('Failed to refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate statistics
  const pendingLeaves = leaveApplications?.filter(leave => leave.status === LeaveStatus.PENDING).length || 0;
  const approvedLeaves = leaveApplications?.filter(leave => leave.status === LeaveStatus.APPROVED).length || 0;
  const rejectedLeaves = leaveApplications?.filter(leave => leave.status === LeaveStatus.REJECTED).length || 0;
  
  // Calculate total remaining days across all leave types
  const totalRemainingDays = leaveBalances?.reduce((total, balance) => total + balance.remainingDays, 0) || 0;

  const isLoading = isLoadingBalances || isLoadingApplications;

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email || 'User'}</p>
        </div>
        <button
          onClick={refreshDashboardData}
          disabled={isLoading || isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Available Leave Days" 
              value={totalRemainingDays} 
              icon={FiCalendar} 
              className="bg-blue-500"
            />
            <StatCard 
              title="Pending Leaves" 
              value={pendingLeaves} 
              icon={FiClock} 
              className="bg-amber-500"
            />
            <StatCard 
              title="Approved Leaves" 
              value={approvedLeaves} 
              icon={FiCheck} 
              className="bg-green-500"
            />
            <StatCard 
              title="Rejected Leaves" 
              value={rejectedLeaves} 
              icon={FiX} 
              className="bg-red-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Your Leave Balances
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Used Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Days
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveBalances?.length ? (
                    leaveBalances.map((balance) => (
                      <tr key={balance.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {balance.leaveType.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {balance.totalDays}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {balance.usedDays}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {balance.remainingDays}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No leave balances found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Leave Applications
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveApplications?.length ? (
                    leaveApplications.slice(0, 5).map((leave) => (
                      <tr key={leave.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.leaveType.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {leave.totalDays}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${leave.status === LeaveStatus.APPROVED && 'bg-green-100 text-green-800'}
                            ${leave.status === LeaveStatus.PENDING && 'bg-yellow-100 text-yellow-800'}
                            ${leave.status === LeaveStatus.REJECTED && 'bg-red-100 text-red-800'}
                            ${leave.status === LeaveStatus.CANCELLED && 'bg-gray-100 text-gray-800'}
                          `}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No leave applications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
} 