'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService, UserService, Department, User } from '@/lib/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [departmentForManager, setDepartmentForManager] = useState<Department | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');

  // Fetch departments
  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentService.getAllDepartments()
  });

  // Fetch managers for dropdown
  const { data: managers, isLoading: isLoadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: () => UserService.getAllManagers()
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: (department: Partial<Department>) => DepartmentService.createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      resetForm();
      toast.success('Department created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create department');
      console.error('Error creating department:', error);
    }
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, department }: { id: number; department: Partial<Department> }) => 
      DepartmentService.updateDepartment(id, department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      resetForm();
      toast.success('Department updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update department');
      console.error('Error updating department:', error);
    }
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => DepartmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete department');
      console.error('Error deleting department:', error);
    }
  });

  // Assign manager mutation
  const assignManagerMutation = useMutation({
    mutationFn: ({ departmentId, managerId }: { departmentId: number; managerId: number }) => 
      DepartmentService.assignManager(departmentId, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowManagerModal(false);
      setDepartmentForManager(null);
      setSelectedManagerId('');
      toast.success('Manager assigned successfully!');
    },
    onError: (error) => {
      toast.error('Failed to assign manager');
      console.error('Error assigning manager:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      managerId: ''
    });
    setSelectedDepartment(null);
  };

  const handleCreateDepartment = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setModalMode('edit');
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.manager?.id?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDeleteDepartment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  const handleOpenManagerModal = (department: Department) => {
    setDepartmentForManager(department);
    setSelectedManagerId(department.manager?.id?.toString() || '');
    setShowManagerModal(true);
  };

  const handleAssignManager = () => {
    if (departmentForManager?.id && selectedManagerId) {
      assignManagerMutation.mutate({
        departmentId: departmentForManager.id,
        managerId: parseInt(selectedManagerId)
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const departmentData: Partial<Department> = {
      name: formData.name,
      description: formData.description || undefined
    };

    if (formData.managerId) {
      departmentData.manager = { id: parseInt(formData.managerId) } as User;
    }

    if (modalMode === 'create') {
      createDepartmentMutation.mutate(departmentData);
    } else if (modalMode === 'edit' && selectedDepartment?.id) {
      updateDepartmentMutation.mutate({
        id: selectedDepartment.id,
        department: departmentData
      });
    }
  };

  const isLoading = isLoadingDepartments || isLoadingManagers || 
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending ||
    deleteDepartmentMutation.isPending || assignManagerMutation.isPending;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Departments</h1>
          <p className="text-gray-600">Manage company departments and their managers</p>
        </div>
        <button
          onClick={handleCreateDepartment}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <div className="flex items-center">
            <FiPlus className="mr-2" />
            <span>Add Department</span>
          </div>
        </button>
      </div>

      {isLoadingDepartments ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.length ? (
            departments.map((department) => (
              <div key={department.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {department.name}
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {department.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center mb-4">
                    <FiUser className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Manager: {department.manager?.firstName ? `${department.manager?.firstName} ${department.manager?.lastName}` : 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenManagerModal(department)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                    >
                      Assign Manager
                    </button>
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                    >
                      <FiEdit2 className="inline mr-1" size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
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
              No departments found. Click "Add Department" to create one.
            </div>
          )}
        </div>
      )}

      {/* Department Form Modal */}
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
                    {modalMode === 'create' ? 'Create Department' : 'Edit Department'}
                  </h3>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name <span className="text-red-500">*</span>
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
                    <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Manager
                    </label>
                    <select
                      id="managerId"
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Manager</option>
                      {managers?.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.fullName}
                        </option>
                      ))}
                    </select>
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

      {/* Assign Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Assign Manager to {departmentForManager?.name}
                </h3>
                <div className="mb-4">
                  <label htmlFor="manager-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Manager
                  </label>
                  <select
                    id="manager-select"
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Manager</option>
                    {managers?.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={!selectedManagerId || assignManagerMutation.isPending}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                    ${!selectedManagerId || assignManagerMutation.isPending ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={handleAssignManager}
                >
                  {assignManagerMutation.isPending ? 'Assigning...' : 'Assign Manager'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowManagerModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 