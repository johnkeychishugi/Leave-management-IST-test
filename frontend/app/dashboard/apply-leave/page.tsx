'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { LeaveTypeService, LeaveApplicationService, LeaveType, LeaveStatus } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parse } from 'date-fns';

export default function ApplyLeavePage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [isBalanceAvailable, setIsBalanceAvailable] = useState<boolean | null>(null);
  const [hasOverlappingLeaves, setHasOverlappingLeaves] = useState(false);

  // Simulate getting user ID from session
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUserId(parseInt(userId));
    }
  }, []);

  // Fetch leave types
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => LeaveTypeService.getAllLeaveTypes()
  });

  // Update formData when date pickers change
  useEffect(() => {
    if (startDate) {
      setFormData(prev => ({
        ...prev,
        startDate: format(startDate, 'yyyy-MM-dd')
      }));
    }
    
    if (endDate) {
      setFormData(prev => ({
        ...prev,
        endDate: format(endDate, 'yyyy-MM-dd')
      }));
    }
  }, [startDate, endDate]);

  // Check for overlapping leaves when dates change
  useEffect(() => {
    const checkOverlappingLeaves = async () => {
      if (userId && formData.startDate && formData.endDate) {
        try {
          const overlappingLeaves = await LeaveApplicationService.getOverlappingLeaves(
            userId,
            formData.startDate,
            formData.endDate
          );
          setHasOverlappingLeaves(overlappingLeaves.length > 0);
        } catch (error) {
          console.error('Error checking overlapping leaves:', error);
        }
      }
    };

    checkOverlappingLeaves();
  }, [userId, formData.startDate, formData.endDate]);

  // Calculate business days when dates change
  useEffect(() => {
    const calculateDays = async () => {
      if (formData.startDate && formData.endDate) {
        try {
          const days = await LeaveApplicationService.calculateBusinessDays(
            formData.startDate,
            formData.endDate
          );
          setTotalDays(days);
        } catch (error) {
          console.error('Error calculating days:', error);
          setTotalDays(null);
        }
      } else {
        setTotalDays(null);
      }
    };

    calculateDays();
  }, [formData.startDate, formData.endDate]);

  // Check leave balance availability when leave type and dates change
  useEffect(() => {
    const checkLeaveBalance = async () => {
      if (userId && formData.leaveTypeId && formData.startDate && formData.endDate) {
        try {
          const isAvailable = await LeaveApplicationService.checkLeaveBalanceAvailability(
            userId,
            parseInt(formData.leaveTypeId),
            formData.startDate,
            formData.endDate
          );
          setIsBalanceAvailable(isAvailable);
        } catch (error) {
          console.error('Error checking leave balance:', error);
          setIsBalanceAvailable(null);
        }
      } else {
        setIsBalanceAvailable(null);
      }
    };

    checkLeaveBalance();
  }, [userId, formData.leaveTypeId, formData.startDate, formData.endDate]);

  // Mutation for creating leave application
  const createLeaveMutation = useMutation({
    mutationFn: (leaveApplication: any) => {
      return LeaveApplicationService.createLeaveApplication(leaveApplication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveApplications', userId] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances', userId] });
      
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setStartDate(undefined);
      setEndDate(undefined);
      
      toast.success('Leave application submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit leave application');
      console.error('Error creating leave application:', error);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !totalDays || !isBalanceAvailable || hasOverlappingLeaves) {
      return;
    }

    const selectedLeaveType = leaveTypes?.find(t => t.id === parseInt(formData.leaveTypeId));
    if (!selectedLeaveType) return;

    const leaveApplication = {
      user: { id: userId },
      leaveType: { id: parseInt(formData.leaveTypeId) },
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays,
      reason: formData.reason,
      status: LeaveStatus.PENDING
    };

    createLeaveMutation.mutate(leaveApplication);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Apply for Leave</h1>
        <p className="text-gray-600">Fill out the form below to submit a leave request</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Leave Application Form
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Leave Type */}
          <div className="mb-6">
            <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              id="leaveTypeId"
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  // When start date changes, ensure end date is not before it
                  if (date && endDate && date > endDate) {
                    setEndDate(date);
                  }
                }}
                placeholder="Select start date"
                minDate={new Date()} // Can't select dates in the past
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                minDate={startDate || new Date()} // Can't select dates before start date
                disabled={!startDate} // Can't select end date before selecting start date
              />
            </div>
          </div>

          {/* Days calculation */}
          {totalDays !== null && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <span>
                  You are applying for <strong>{totalDays}</strong> working days of leave.
                </span>
              </div>
            </div>
          )}

          {/* Balance warning */}
          {isBalanceAvailable === false && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <span>
                  You don't have enough leave balance for this request.
                </span>
              </div>
            </div>
          )}

          {/* Overlapping leaves warning */}
          {hasOverlappingLeaves && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <span>
                  You already have approved or pending leave during this period.
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                !formData.leaveTypeId || 
                !formData.startDate || 
                !formData.endDate || 
                !formData.reason || 
                !isBalanceAvailable || 
                hasOverlappingLeaves ||
                createLeaveMutation.isPending
              }
              className={`
                px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${
                  !formData.leaveTypeId || 
                  !formData.startDate || 
                  !formData.endDate || 
                  !formData.reason || 
                  !isBalanceAvailable || 
                  hasOverlappingLeaves ||
                  createLeaveMutation.isPending
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }
              `}
            >
              {createLeaveMutation.isPending ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 