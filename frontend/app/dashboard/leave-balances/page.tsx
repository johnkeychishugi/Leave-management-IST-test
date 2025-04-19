'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LeaveBalanceService } from '@/lib/api/leaveBalances';
import { getCurrentYear } from '@/lib/utils/dateUtils';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveBalance } from '@/lib/api/types';

export default function LeaveBalancesPage() {
  const { user } = useAuth();
  const currentYear = getCurrentYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Fetch leave balances for the current user and selected year
  const { data: leaveBalances, isLoading, error } = useQuery({
    queryKey: ['leaveBalances', user?.id, selectedYear],
    queryFn: () => LeaveBalanceService.getLeaveBalancesByUserIdAndYear(user?.id || 0, selectedYear),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <LeaveBalancesSkeleton />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Leave Balances</h1>
          <p className="text-gray-600">View your available leave days</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Error loading leave balances</h3>
              <p className="text-sm text-red-600 mt-2">
                Please try again later or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Leave Balances</h1>
          <p className="text-gray-600">View your available leave days</p>
        </div>
      </div>
      
      <Tabs defaultValue={currentYear.toString()} className="w-full">
        <TabsList className="bg-gray-100 p-1 mb-4 rounded-md">
          {[currentYear, currentYear - 1].map((year) => (
            <TabsTrigger
              key={year}
              value={year.toString()}
              onClick={() => setSelectedYear(year)}
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-4"
            >
              {year}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {[currentYear, currentYear - 1].map((year) => (
          <TabsContent key={year} value={year.toString()}>
            <LeaveBalancesTable leaveBalances={leaveBalances || []} year={year} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function LeaveBalancesTable({ leaveBalances, year }: { leaveBalances: LeaveBalance[], year: number }) {
  if (leaveBalances.length === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-800">No leave balances found</h3>
            <p className="text-sm text-gray-500 mt-2">
              You don't have any leave balances for the year {year}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-white rounded-t-lg">
        <CardTitle className="text-xl text-gray-800">Leave Balances for {year}</CardTitle>
        <CardDescription className="text-gray-500">
          Overview of your leave balances for the year {year}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Leave Type</TableHead>
              <TableHead className="font-semibold text-gray-700">Total Days</TableHead>
              <TableHead className="font-semibold text-gray-700">Used Days</TableHead>
              <TableHead className="font-semibold text-gray-700">Remaining</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Carried Over</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Expiry Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveBalances.map((balance) => (
              <TableRow key={balance.id} className="hover:bg-gray-50">
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
                <TableCell className="hidden md:table-cell text-gray-700">{balance.carriedOverDays || 0}</TableCell>
                <TableCell className="hidden md:table-cell text-gray-700">
                  {balance.expiryDate ? new Date(balance.expiryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(balance.usedDays / balance.totalDays) * 100} 
                      className="h-2 bg-gray-200"
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {Math.round((balance.usedDays / balance.totalDays) * 100)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LeaveBalancesSkeleton() {
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-48 mb-4" />
      
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 