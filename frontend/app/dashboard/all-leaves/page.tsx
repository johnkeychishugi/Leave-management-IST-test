'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveApplicationService } from '@/lib/api/leaveApplications';
import { LeaveStatus, LeaveApplication } from '@/lib/api/types';
import LeaveApplicationTable from '@/components/leaves/LeaveApplicationTable';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, format } from 'date-fns';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors = {
  [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [LeaveStatus.APPROVED]: 'bg-green-100 text-green-800',
  [LeaveStatus.REJECTED]: 'bg-red-100 text-red-800',
  [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};

const AllLeavesPage = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [statusFilter, setStatusFilter] = useState<LeaveStatus[]>([]);

  // Fetch all leave applications
  const { data: allLeaves = [], isLoading, error } = useQuery({
    queryKey: ['allLeaves', dateRange],
    queryFn: async () => {
      if (dateRange.from && dateRange.to) {
        return LeaveApplicationService.getAllLeavesInDateRange(
          format(dateRange.from, 'yyyy-MM-dd'),
          format(dateRange.to, 'yyyy-MM-dd')
        );
      }
      return LeaveApplicationService.getAllLeaveApplications();
    },
  });

  // Filter leaves based on status
  const filteredLeaves = allLeaves.filter((leave) => {
    if (statusFilter.length === 0) return true;
    return statusFilter.includes(leave.status);
  });

  // Group leaves by status for tabs
  const leavesByStatus = {
    all: filteredLeaves,
    pending: filteredLeaves.filter((leave) => leave.status === LeaveStatus.PENDING),
    approved: filteredLeaves.filter((leave) => leave.status === LeaveStatus.APPROVED),
    rejected: filteredLeaves.filter((leave) => leave.status === LeaveStatus.REJECTED),
    cancelled: filteredLeaves.filter((leave) => leave.status === LeaveStatus.CANCELLED),
  };

  const toggleStatusFilter = (status: LeaveStatus) => {
    setStatusFilter((current) => {
      if (current.includes(status)) {
        return current.filter((s) => s !== status);
      } else {
        return [...current, status];
      }
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading leave applications. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">All Leave Applications</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DateRangePicker
            value={dateRange}
            onChange={(newDateRange) => {
              if (newDateRange && newDateRange.from) {
                setDateRange({
                  from: newDateRange.from,
                  to: newDateRange.to || new Date()
                });
              }
            }}
            align="end"
            className="w-full sm:w-auto"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    {statusFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes(LeaveStatus.PENDING)}
                onCheckedChange={() => toggleStatusFilter(LeaveStatus.PENDING)}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes(LeaveStatus.APPROVED)}
                onCheckedChange={() => toggleStatusFilter(LeaveStatus.APPROVED)}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes(LeaveStatus.REJECTED)}
                onCheckedChange={() => toggleStatusFilter(LeaveStatus.REJECTED)}
              >
                Rejected
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes(LeaveStatus.CANCELLED)}
                onCheckedChange={() => toggleStatusFilter(LeaveStatus.CANCELLED)}
              >
                Cancelled
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-3">
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All ({leavesByStatus.all.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({leavesByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({leavesByStatus.approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({leavesByStatus.rejected.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({leavesByStatus.cancelled.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-6">
          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : leavesByStatus.all.length > 0 ? (
              <LeaveApplicationTable leaveApplications={leavesByStatus.all} showActions={false} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No leave applications found for the selected criteria.
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending" className="m-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : leavesByStatus.pending.length > 0 ? (
              <LeaveApplicationTable leaveApplications={leavesByStatus.pending} showActions={false} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No pending leave applications found.
              </div>
            )}
          </TabsContent>
          <TabsContent value="approved" className="m-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : leavesByStatus.approved.length > 0 ? (
              <LeaveApplicationTable leaveApplications={leavesByStatus.approved} showActions={false} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No approved leave applications found.
              </div>
            )}
          </TabsContent>
          <TabsContent value="rejected" className="m-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : leavesByStatus.rejected.length > 0 ? (
              <LeaveApplicationTable leaveApplications={leavesByStatus.rejected} showActions={false} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No rejected leave applications found.
              </div>
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="m-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : leavesByStatus.cancelled.length > 0 ? (
              <LeaveApplicationTable leaveApplications={leavesByStatus.cancelled} showActions={false} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No cancelled leave applications found.
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllLeavesPage; 