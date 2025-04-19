'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveApplicationService, LeaveStatus, LeaveApplication } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiCheck, FiX, FiMessageSquare, FiUser } from 'react-icons/fi';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/lib/context/AuthContext';

export default function PendingApprovalsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');

  // Simulate getting user ID from session
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUserId(parseInt(userId));
    }
  }, []);

  // Fetch all leave applications and filter for pending ones
  const { data: allLeaveApplications, isLoading, isError } = useQuery({
    queryKey: ['leaveApplications', 'pending'],
    queryFn: () => LeaveApplicationService.getAllLeaveApplications(LeaveStatus.PENDING),
  });

  // Filter applications that need approval (simplified filtering)
  const pendingApprovals = allLeaveApplications;

  // Approve leave application mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number, comments?: string }) => 
      LeaveApplicationService.approveLeaveApplication(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveApplications'] });
      toast.success('Leave application approved successfully');
      setShowApproveModal(false);
      setSelectedApplication(null);
      setComments('');
    },
    onError: (error: any) => {
      console.error('Error approving leave application:', error);
      toast.error('Failed to approve leave application');
    }
  });

  // Reject leave application mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number, comments: string }) => 
      LeaveApplicationService.rejectLeaveApplication(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveApplications'] });
      toast.success('Leave application rejected');
      setShowRejectModal(false);
      setSelectedApplication(null);
      setComments('');
    },
    onError: (error: any) => {
      console.error('Error rejecting leave application:', error);
      toast.error('Failed to reject leave application');
    }
  });

  const handleApprove = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setShowApproveModal(true);
  };

  const handleReject = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
  };

  const submitApproval = () => {
    if (!selectedApplication) return;
    approveMutation.mutate({ 
      id: selectedApplication.id as number, 
      comments 
    });
  };

  const submitRejection = () => {
    if (!selectedApplication || !comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate({ 
      id: selectedApplication.id as number, 
      comments 
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="py-8 px-4 text-red-500">Error loading pending approvals</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Pending Leave Approvals</h1>
        <p className="text-gray-600">Review and manage leave requests awaiting your approval</p>
      </div>

      {pendingApprovals && pendingApprovals.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
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
                {pendingApprovals.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <FiUser className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.user.firstName} {application.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.leaveType.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.totalDays}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{application.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                      
                        <button
                          onClick={() => handleApprove(application)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FiCheck className="mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(application)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiX className="mr-1" /> Reject
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <FiCalendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have any leave applications waiting for your approval at the moment.
          </p>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedApplication && (
        <Modal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title="Approve Leave Application"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                You are about to approve the leave application for:
              </p>
              <p className="mt-1 font-medium">
                {selectedApplication.user.firstName} {selectedApplication.user.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Duration:</span>{' '}
                {new Date(selectedApplication.startDate).toLocaleDateString()} - {new Date(selectedApplication.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments (Optional)
              </label>
              <textarea
                id="comments"
                rows={3}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Add optional comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={submitApproval}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Leave Application"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                You are about to reject the leave application for:
              </p>
              <p className="mt-1 font-medium">
                {selectedApplication.user.firstName} {selectedApplication.user.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Duration:</span>{' '}
                {new Date(selectedApplication.startDate).toLocaleDateString()} - {new Date(selectedApplication.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectReason"
                rows={3}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Provide a reason for rejection"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
              {comments.trim() === '' && (
                <p className="mt-1 text-xs text-red-500">A reason is required for rejection</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={submitRejection}
                disabled={rejectMutation.isPending || !comments.trim()}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
} 