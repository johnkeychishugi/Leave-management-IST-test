'use client';

import React from 'react';
import { LeaveApplication, LeaveStatus } from '@/lib/api/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeaveApplicationTableProps {
  leaveApplications: LeaveApplication[];
  showActions?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const statusColors = {
  [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [LeaveStatus.APPROVED]: 'bg-green-100 text-green-800',
  [LeaveStatus.REJECTED]: 'bg-red-100 text-red-800',
  [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};

const LeaveApplicationTable = ({
  leaveApplications,
  showActions = true,
  onApprove,
  onReject,
}: LeaveApplicationTableProps) => {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveApplications.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{leave.id}</TableCell>
              <TableCell>
                {leave.user.firstName} {leave.user.lastName}
              </TableCell>
              <TableCell>{leave.leaveType.name}</TableCell>
              <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{leave.totalDays}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>
                  {leave.status}
                </span>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  {leave.status === LeaveStatus.PENDING && (
                    <div className="flex justify-end gap-2">
                      {onApprove && (
                        <button
                          onClick={() => onApprove(leave.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-50 text-green-700 hover:bg-green-100 h-8 px-3"
                        >
                          Approve
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(leave.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-50 text-red-700 hover:bg-red-100 h-8 px-3"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {leaveApplications.length === 0 && (
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center">
                No leave applications found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaveApplicationTable; 