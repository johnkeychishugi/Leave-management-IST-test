'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService, User, Department, DepartmentService } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiEdit2, FiTrash2, FiPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';
import { useConfirmDialog } from '@/lib/context/ConfirmProvider';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [formValues, setFormValues] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const { confirm } = useConfirmDialog();

  // Fetch users data
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
  });

  // Fetch departments for dropdown
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: DepartmentService.getAllDepartments,
  });

  // Fetch managers for dropdown
  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: UserService.getAllManagers,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating user: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: { id: number; user: Partial<User> }) => 
      UserService.updateUser(userData.id, userData.user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
  });

  // Activate/Deactivate user mutations
  const activateUserMutation = useMutation({
    mutationFn: UserService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error activating user: ${error.message}`);
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: UserService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deactivating user: ${error.message}`);
    },
  });

  // Open modal for create/edit
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormValues({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        manager: user.manager,
        active: user.active
      });
    } else {
      setEditingUser(null);
      setFormValues({
        firstName: '',
        lastName: '',
        email: '',
        active: true
      });
    }
    setIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsOpen(false);
    setEditingUser(null);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data object
    const userData: any = { ...formValues };
    
    // Extract department and manager IDs if they exist
    if (userData.department) {
      userData.departmentId = userData.department.id;
      delete userData.department;
    }
    
    if (userData.manager) {
      userData.managerId = userData.manager.id;
      delete userData.manager;
    }
    
    if (editingUser?.id) {
      updateUserMutation.mutate({ id: editingUser.id, user: userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  // Handle user deletion
  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      deleteUserMutation.mutate(id);
    }
  };

  // Handle user activation/deactivation
  const toggleUserStatus = (user: User) => {
    if (user.active) {
      deactivateUserMutation.mutate(user.id);
    } else {
      activateUserMutation.mutate(user.id);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all users in the system including their name, email, department, and status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <FiPlus className="mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Department
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Manager
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users?.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {user.fullName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.department?.name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.manager ? `${user.manager.fullName}` : 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className="text-gray-600 hover:text-gray-900 mr-2"
                              title={user.active ? 'Deactivate' : 'Activate'}
                            >
                              {user.active ? <FiUserX /> : <FiUserCheck />}
                            </button>
                            <button
                              onClick={() => openModal(user)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!users || users.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {editingUser ? 'Edit User' : 'Create User'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formValues.firstName || ''}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formValues.lastName || ''}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formValues.email || ''}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      {!editingUser && (
                        <div className="col-span-2">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            onChange={handleChange}
                            required={!editingUser}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      )}
                      
                      <div className="col-span-2">
                        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          id="departmentId"
                          name="departmentId"
                          value={formValues.department?.id || ''}
                          onChange={(e) => {
                            const departmentId = parseInt(e.target.value);
                            if (!isNaN(departmentId)) {
                              const selectedDepartment = departments?.find(d => d.id === departmentId);
                              setFormValues({
                                ...formValues,
                                department: selectedDepartment
                              });
                            } else {
                              setFormValues({
                                ...formValues,
                                department: undefined
                              });
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a department</option>
                          {departments?.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">
                          Manager
                        </label>
                        <select
                          id="managerId"
                          name="managerId"
                          value={formValues.manager?.id || ''}
                          onChange={(e) => {
                            const managerId = parseInt(e.target.value);
                            if (!isNaN(managerId)) {
                              const selectedManager = managers?.find(u => u.id === managerId);
                              setFormValues({
                                ...formValues,
                                manager: selectedManager
                              });
                            } else {
                              setFormValues({
                                ...formValues,
                                manager: undefined
                              });
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a manager</option>
                          {managers?.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center mt-4">
                          <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formValues.active || false}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                            Active
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {editingUser ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 