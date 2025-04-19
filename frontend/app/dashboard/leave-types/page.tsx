'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveTypeService, LeaveType } from '@/lib/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDays: '',
    color: '#6366f1' // Default indigo color
  });

  // Fetch leave types
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => LeaveTypeService.getAllLeaveTypes()
  });

  // Create leave type mutation
  const createLeaveTypeMutation = useMutation({
    mutationFn: (leaveType: Partial<LeaveType>) => LeaveTypeService.createLeaveType(leaveType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      setShowModal(false);
      resetForm();
      toast.success('Leave type created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create leave type');
      console.error('Error creating leave type:', error);
    }
  });

  // Update leave type mutation
  const updateLeaveTypeMutation = useMutation({
    mutationFn: ({ id, leaveType }: { id: number; leaveType: Partial<LeaveType> }) => 
      LeaveTypeService.updateLeaveType(id, leaveType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      setShowModal(false);
      resetForm();
      toast.success('Leave type updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update leave type');
      console.error('Error updating leave type:', error);
    }
  });

  // Delete leave type mutation
  const deleteLeaveTypeMutation = useMutation({
    mutationFn: (id: number) => LeaveTypeService.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      toast.success('Leave type deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete leave type');
      console.error('Error deleting leave type:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      defaultDays: '',
      color: '#6366f1'
    });
    setSelectedLeaveType(null);
  };

  const handleCreateLeaveType = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const handleEditLeaveType = (leaveType: LeaveType) => {
    setModalMode('edit');
    setSelectedLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description || '',
      defaultDays: leaveType.defaultDays?.toString() || '',
      color: leaveType.color || '#6366f1'
    });
    setShowModal(true);
  };

  const handleDeleteLeaveType = (id: number) => {
    if (window.confirm('Are you sure you want to delete this leave type? This action cannot be undone.')) {
      deleteLeaveTypeMutation.mutate(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leaveTypeData: Partial<LeaveType> = {
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      defaultDays: formData.defaultDays ? parseInt(formData.defaultDays) : undefined
    };

    if (modalMode === 'create') {
      createLeaveTypeMutation.mutate(leaveTypeData);
    } else if (modalMode === 'edit' && selectedLeaveType?.id) {
      updateLeaveTypeMutation.mutate({
        id: selectedLeaveType.id,
        leaveType: leaveTypeData
      });
    }
  };

  const isLoading = isLoadingLeaveTypes || 
    createLeaveTypeMutation.isPending || 
    updateLeaveTypeMutation.isPending ||
    deleteLeaveTypeMutation.isPending;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Leave Types</h1>
          <p className="text-gray-600">Manage leave types and their default allocations</p>
        </div>
        <button
          onClick={handleCreateLeaveType}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <div className="flex items-center">
            <FiPlus className="mr-2" />
            <span>Add Leave Type</span>
          </div>
        </button>
      </div>

      {isLoadingLeaveTypes ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveTypes?.length ? (
            leaveTypes.map((leaveType) => (
              <div key={leaveType.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="px-6 py-4 border-b" 
                  style={{ borderColor: leaveType.color || '#d1d5db' }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: leaveType.color || '#6366f1' }}
                    ></div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {leaveType.name}
                    </h2>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {leaveType.description || 'No description provided.'}
                  </p>
                  <div className="text-sm font-medium text-gray-700 mb-4">
                    Default Days: {leaveType.defaultDays || 'Not specified'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditLeaveType(leaveType)}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                    >
                      <FiEdit2 className="inline mr-1" size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(leaveType.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                    >
                      <FiTrash2 className="inline mr-1" size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No leave types found. Click "Add Leave Type" to create one.
            </div>
          )}
        </div>
      )}

      {/* Leave Type Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {modalMode === 'create' ? 'Create Leave Type' : 'Edit Leave Type'}
                  </h3>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="defaultDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Days
                    </label>
                    <input
                      type="number"
                      id="defaultDays"
                      name="defaultDays"
                      value={formData.defaultDays}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="h-9 w-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mr-2"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={handleInputChange}
                        name="color"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                      ${!formData.name || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  >
                    {isLoading ? 'Processing...' : modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 