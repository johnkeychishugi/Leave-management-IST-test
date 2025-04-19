'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveApplicationService, LeaveStatus } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiEye, FiTrash2, FiX, FiCalendar, FiList } from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function MyLeavesPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | 'ALL'>('ALL');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  // Simulate getting user ID from session
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUserId(parseInt(userId));
    }
  }, []);

  // Fetch user's leave applications
  const { data: leaveApplications, isLoading } = useQuery({
    queryKey: ['leaveApplications', userId, selectedStatus],
    queryFn: async () => {
      if (!userId) return [];
      if (selectedStatus === 'ALL') {
        return LeaveApplicationService.getLeaveApplicationsByUserId(userId);
      } else {
        return LeaveApplicationService.getLeaveApplicationsByUserIdAndStatus(userId, selectedStatus);
      }
    },
    enabled: !!userId
  });

  // Mutation for cancelling leave application
  const cancelLeaveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      LeaveApplicationService.cancelLeaveApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveApplications', userId] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances', userId] });
      toast.success('Leave application cancelled successfully!');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedLeaveId(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel leave application');
      console.error('Error cancelling leave application:', error);
    }
  });

  // Mutation for deleting leave application
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => LeaveApplicationService.deleteLeaveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveApplications', userId] });
      toast.success('Leave application deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete leave application');
      console.error('Error deleting leave application:', error);
    }
  });

  const handleOpenCancelModal = (id: number) => {
    setSelectedLeaveId(id);
    setShowCancelModal(true);
  };

  const handleCancelLeave = () => {
    if (selectedLeaveId && cancelReason.trim()) {
      cancelLeaveMutation.mutate({ id: selectedLeaveId, reason: cancelReason });
    }
  };

  const handleDeleteLeave = (id: number) => {
    if (window.confirm('Are you sure you want to delete this leave application? This action cannot be undone.')) {
      deleteLeaveMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format leave applications for calendar view
  const calendarEvents = leaveApplications?.map(leave => ({
    id: String(leave.id),
    title: `${leave.leaveType.name} (${leave.status})`,
    start: leave.startDate,
    end: leave.endDate,
    extendedProps: {
      status: leave.status,
      reason: leave.reason,
      totalDays: leave.totalDays,
      leaveType: leave.leaveType.name
    },
    backgroundColor: getEventColor(leave.status),
    borderColor: getEventBorderColor(leave.status),
    textColor: getEventTextColor(leave.status),
    allDay: true
  })) || [];

  // Get colors based on leave status
  function getEventColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return '#d1fae5'; // light green
      case LeaveStatus.PENDING:
        return '#fef3c7'; // light yellow
      case LeaveStatus.REJECTED:
        return '#fee2e2'; // light red
      case LeaveStatus.CANCELLED:
        return '#f3f4f6'; // light gray
      default:
        return '#e5e7eb'; // default light gray
    }
  }

  function getEventBorderColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return '#10b981'; // green
      case LeaveStatus.PENDING:
        return '#f59e0b'; // yellow
      case LeaveStatus.REJECTED:
        return '#ef4444'; // red
      case LeaveStatus.CANCELLED:
        return '#9ca3af'; // gray
      default:
        return '#6b7280'; // default gray
    }
  }

  function getEventTextColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return '#065f46'; // dark green
      case LeaveStatus.PENDING:
        return '#92400e'; // dark yellow
      case LeaveStatus.REJECTED:
        return '#b91c1c'; // dark red
      case LeaveStatus.CANCELLED:
        return '#4b5563'; // dark gray
      default:
        return '#1f2937'; // default dark gray
    }
  }

  // Handle calendar event click
  const handleEventClick = (info: any) => {
    const event = info.event;
    const { status, reason, totalDays, leaveType } = event.extendedProps;
    
    toast.success(
      <div>
        <p><strong>{leaveType}</strong> ({status})</p>
        <p>Days: {totalDays}</p>
        <p>Reason: {reason}</p>
      </div>
    );
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Leave Applications</h1>
        <p className="text-gray-600">View and manage your leave requests</p>
      </div>

      {/* View Switcher and Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-4 py-1 text-sm rounded-md ${
              selectedStatus === 'ALL' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus(LeaveStatus.PENDING)}
            className={`px-4 py-1 text-sm rounded-md ${
              selectedStatus === LeaveStatus.PENDING
                ? 'bg-indigo-600 text-white'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus(LeaveStatus.APPROVED)}
            className={`px-4 py-1 text-sm rounded-md ${
              selectedStatus === LeaveStatus.APPROVED
                ? 'bg-indigo-600 text-white'
                : 'bg-green-100 text-green-800'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setSelectedStatus(LeaveStatus.REJECTED)}
            className={`px-4 py-1 text-sm rounded-md ${
              selectedStatus === LeaveStatus.REJECTED
                ? 'bg-indigo-600 text-white'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setSelectedStatus(LeaveStatus.CANCELLED)}
            className={`px-4 py-1 text-sm rounded-md ${
              selectedStatus === LeaveStatus.CANCELLED
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            Cancelled
          </button>
        </div>

        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 flex items-center ${
              view === 'list' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiList className="mr-2" /> List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 flex items-center ${
              view === 'calendar' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiCalendar className="mr-2" /> Calendar View
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : view === 'list' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveApplications?.length ? (
                  leaveApplications.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.leaveType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {leave.totalDays}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                          {leave.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          
                          {leave.status === LeaveStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handleOpenCancelModal(leave.id)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Cancel Leave"
                              >
                                <FiX size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteLeave(leave.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Application"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No leave applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-[700px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="100%"
            />
          </div>
        </div>
      )}

      {/* Cancel Leave Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Cancel Leave Application
                    </h3>
                    <div className="mt-2">
                      <textarea
                        placeholder="Please provide a reason for cancellation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                    ${cancelReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={handleCancelLeave}
                  disabled={!cancelReason.trim() || cancelLeaveMutation.isPending}
                >
                  {cancelLeaveMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 