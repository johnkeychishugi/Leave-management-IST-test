'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveBalanceService } from '@/lib/api/leaveBalances';
import { UserService } from '@/lib/api/users';
import { LeaveTypeService } from '@/lib/api/leaveTypes';
import { getCurrentYear } from '@/lib/utils/dateUtils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveBalance, LeaveType, User } from '@/lib/api/types';
import { FiEdit, FiPlus, FiRefreshCw, FiTrash, FiUserPlus } from 'react-icons/fi';
import { useConfirmDialog } from '@/lib/context/ConfirmProvider';

export default function AdminLeaveBalancesPage() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = getCurrentYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState<{id: number, balance: LeaveBalance} | null>(null);
  const { confirm } = useConfirmDialog();
  
  // Redirect if not admin or HR
  if (user && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_HR')) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Unauthorized</h1>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
              <p className="text-sm text-red-600 mt-2">
                Only administrators and HR staff can manage leave balances.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getAllUsers(),
  });

  // Fetch all leave types
  const { data: leaveTypes, isLoading: leaveTypesLoading } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => LeaveTypeService.getAllLeaveTypes(),
  });

  // Fetch leave balances (either all or filtered by user)
  const { data: leaveBalances, isLoading: balancesLoading, refetch } = useQuery({
    queryKey: ['adminLeaveBalances', selectedUser, selectedYear],
    queryFn: () => selectedUser 
      ? LeaveBalanceService.getLeaveBalancesByUserIdAndYear(selectedUser, selectedYear)
      : LeaveBalanceService.getAllLeaveBalances().then(balances => 
          balances.filter(balance => balance.year === selectedYear)
        ),
  });

  // Create leave balance mutation
  const createBalanceMutation = useMutation({
    mutationFn: (newBalance: Partial<LeaveBalance>) => 
      LeaveBalanceService.createLeaveBalance(newBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeaveBalances'] });
      toast.success('Leave balance created successfully');
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast.error(`Error creating leave balance: ${error.message}`);
    }
  });

  // Adjust leave balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: ({ id, days, reason }: { id: number, days: number, reason: string }) =>
      LeaveBalanceService.adjustLeaveBalance(id, days, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeaveBalances'] });
      toast.success('Leave balance adjusted successfully');
      setShowAdjustForm(null);
    },
    onError: (error: any) => {
      toast.error(`Error adjusting leave balance: ${error.message}`);
    }
  });

  // Delete leave balance mutation
  const deleteBalanceMutation = useMutation({
    mutationFn: (id: number) => LeaveBalanceService.deleteLeaveBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeaveBalances'] });
      toast.success('Leave balance deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting leave balance: ${error.message}`);
    }
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form state for creating a new balance
  const [newBalance, setNewBalance] = useState({
    userId: '',
    leaveTypeId: '',
    year: selectedYear,
    totalDays: 0,
    usedDays: 0,
    carriedOverDays: 0,
  });

  // Form state for adjusting a balance
  const [adjustment, setAdjustment] = useState({
    days: 0,
    reason: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBalance({
      ...newBalance,
      [name]: name === 'year' || name === 'totalDays' || name === 'usedDays' || name === 'carriedOverDays'
        ? Number(value) 
        : value
    });
  };

  // Handle adjustment form input changes
  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdjustment({
      ...adjustment,
      [name]: name === 'days' ? Number(value) : value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBalance.userId || !newBalance.leaveTypeId) {
      toast.error('Please select a user and leave type');
      return;
    }

    createBalanceMutation.mutate({
      user: { id: Number(newBalance.userId) } as User,
      leaveType: { id: Number(newBalance.leaveTypeId) } as LeaveType,
      year: newBalance.year,
      totalDays: newBalance.totalDays,
      usedDays: newBalance.usedDays,
      carriedOverDays: newBalance.carriedOverDays
    });
  };

  // Handle adjustment submission
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustForm) return;
    
    if (!adjustment.days || !adjustment.reason) {
      toast.error('Please enter days and reason for adjustment');
      return;
    }

    adjustBalanceMutation.mutate({
      id: showAdjustForm.id,
      days: adjustment.days,
      reason: adjustment.reason
    });
  };

  const isLoading = usersLoading || leaveTypesLoading || balancesLoading;

  if (isLoading) {
    return <AdminLeaveBalancesSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Leave Balances</h1>
          <p className="text-gray-600">Add, adjust, or remove employees' leave balances</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {showAddForm ? 'Cancel' : <><FiPlus size={16} /> Add Leave Balance</>}
          </Button>
          <Button 
            onClick={() => refetch()}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
          >
            <FiRefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Add Leave Balance Form */}
      {showAddForm && (
        <Card className="border-gray-200 bg-white shadow-sm mb-6">
          <CardHeader className="border-b border-gray-100 bg-white rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">Add New Leave Balance</CardTitle>
            <CardDescription className="text-gray-500">
              Create a new leave balance for an employee
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="userId"
                  value={newBalance.userId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {filteredUsers?.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  name="leaveTypeId"
                  value={newBalance.leaveTypeId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes?.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={newBalance.year}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear-1}>{currentYear-1}</option>
                  <option value={currentYear+1}>{currentYear+1}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                <input
                  type="number"
                  name="totalDays"
                  value={newBalance.totalDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used Days</label>
                <input
                  type="number"
                  name="usedDays"
                  value={newBalance.usedDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carried Over Days</label>
                <input
                  type="number"
                  name="carriedOverDays"
                  value={newBalance.carriedOverDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.5"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t border-gray-100 p-4">
              <Button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={createBalanceMutation.isPending}
              >
                {createBalanceMutation.isPending ? 'Creating...' : 'Create Leave Balance'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Adjustment Form */}
      {showAdjustForm && (
        <Card className="border-gray-200 bg-white shadow-sm mb-6">
          <CardHeader className="border-b border-gray-100 bg-white rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">
              Adjust Leave Balance for {showAdjustForm.balance.user.firstName} {showAdjustForm.balance.user.lastName}
            </CardTitle>
            <CardDescription className="text-gray-500">
              Add or remove days from {showAdjustForm.balance.leaveType.name} balance for {selectedYear}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAdjustmentSubmit}>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment (Days)</label>
                <input
                  type="number"
                  name="days"
                  value={adjustment.days}
                  onChange={handleAdjustmentChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  step="0.5"
                  required
                  placeholder="Enter positive value to add, negative to subtract"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter positive value to add days, negative to remove days
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  name="reason"
                  value={adjustment.reason}
                  onChange={handleAdjustmentChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                  placeholder="Provide a reason for this adjustment"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t border-gray-100 p-4">
              <Button 
                type="button"
                onClick={() => setShowAdjustForm(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={adjustBalanceMutation.isPending}
              >
                {adjustBalanceMutation.isPending ? 'Adjusting...' : 'Save Adjustment'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
          <input
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Employees</option>
            {filteredUsers?.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={currentYear+1}>{currentYear+1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear-1}>{currentYear-1}</option>
          </select>
        </div>
      </div>

      {/* Leave Balances Table */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Leave Balances for {selectedYear}</CardTitle>
          <CardDescription className="text-gray-500">
            {selectedUser 
              ? `Showing leave balances for the selected employee` 
              : `Showing leave balances for all employees`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {leaveBalances?.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-800">No leave balances found</h3>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                No leave balances found for the selected criteria.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white mx-auto"
              >
                <FiUserPlus size={16} /> Add New Leave Balance
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-700">Leave Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total Days</TableHead>
                  <TableHead className="font-semibold text-gray-700">Used Days</TableHead>
                  <TableHead className="font-semibold text-gray-700">Remaining</TableHead>
                  <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Carried Over</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances?.map((balance) => (
                  <TableRow key={balance.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-800">
                        {balance.user.firstName} {balance.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{balance.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-800">{balance.leaveType.name}</div>
                      <div className="text-xs text-gray-500">{balance.leaveType.description}</div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-800">{balance.totalDays}</TableCell>
                    <TableCell className="font-medium text-gray-800">{balance.usedDays}</TableCell>
                    <TableCell>
                      <Badge
                        variant={balance.remainingDays > 0 ? "outline" : "secondary"}
                        className={`font-semibold ${balance.remainingDays > 0 ? 'border-indigo-500 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {balance.remainingDays}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-700">
                      {balance.carriedOverDays || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setShowAdjustForm({id: balance.id, balance}); 
                            setAdjustment({days: 0, reason: ''});
                          }}
                          className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                          title="Adjust Balance"
                        >
                          <FiEdit size={16} />
                        </Button>
                        <Button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: "Delete Leave Balance",
                              message: `Are you sure you want to delete this leave balance for ${balance.user.firstName} ${balance.user.lastName}?`,
                              confirmText: "Delete",
                              cancelText: "Cancel",
                              type: "danger"
                            });
                            
                            if (confirmed) {
                              deleteBalanceMutation.mutate(balance.id);
                            }
                          }}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          title="Delete Balance"
                        >
                          <FiTrash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminLeaveBalancesSkeleton() {
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 