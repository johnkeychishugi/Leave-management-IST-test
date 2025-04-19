"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LeaveApplicationService,
  LeaveStatus,
  LeaveApplication,
} from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiUser,
  FiList,
  FiClock,
  FiAlertCircle,
  FiCheckSquare,
} from "react-icons/fi";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/lib/context/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function AllLeavesPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | "ALL">(
    "ALL"
  );
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<LeaveApplication | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");

  // Get user ID from local storage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUserId(parseInt(userId));
    }
  }, []);

  // Fetch leave applications with filtering
  const {
    data: leaveApplications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allLeaveApplications", selectedStatus, selectedUser],
    queryFn: async () => {
      let applications = await LeaveApplicationService.getAllLeaveApplications(
        selectedStatus === "ALL" ? undefined : selectedStatus
      );

      // Filter by selected user if one is selected
      if (selectedUser) {
        applications = applications.filter(
          (app) => app.user.id === selectedUser
        );
      }

      return applications;
    },
  });

  // Calculate counts for dashboard cards
  const pendingCount =
    leaveApplications?.filter((app) => app.status === LeaveStatus.PENDING)
      .length || 0;

  const approvedCount =
    leaveApplications?.filter((app) => app.status === LeaveStatus.APPROVED)
      .length || 0;

  const rejectedCount =
    leaveApplications?.filter((app) => app.status === LeaveStatus.REJECTED)
      .length || 0;

  const cancelledCount =
    leaveApplications?.filter((app) => app.status === LeaveStatus.CANCELLED)
      .length || 0;

  // Let's assume an average employee has 15 leave days (this would typically come from your backend)
  const availableLeaveDays = 15;

  // Approve leave application mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) =>
      LeaveApplicationService.approveLeaveApplication(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLeaveApplications"] });
      toast.success("Leave application approved successfully");
      setShowApproveModal(false);
      setSelectedApplication(null);
      setComments("");
    },
    onError: (error: any) => {
      console.error("Error approving leave application:", error);
      toast.error("Failed to approve leave application");
    },
  });

  // Reject leave application mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) =>
      LeaveApplicationService.rejectLeaveApplication(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLeaveApplications"] });
      toast.success("Leave application rejected");
      setShowRejectModal(false);
      setSelectedApplication(null);
      setComments("");
    },
    onError: (error: any) => {
      console.error("Error rejecting leave application:", error);
      toast.error("Failed to reject leave application");
    },
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
      comments,
    });
  };

  const submitRejection = () => {
    if (!selectedApplication || !comments.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate({
      id: selectedApplication.id as number,
      comments,
    });
  };

  const getStatusBadgeClass = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case LeaveStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case LeaveStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case LeaveStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if user can modify the application
  const canModifyApplication = () => {
    return hasRole("ROLE_ADMIN") || hasRole("ROLE_HR");
  };

  // Format leave applications for calendar view
  const calendarEvents =
    leaveApplications?.map((leave) => ({
      id: String(leave.id),
      title: `${leave.user.firstName} ${leave.user.lastName} - ${leave.leaveType.name}`,
      start: leave.startDate,
      end: leave.endDate,
      extendedProps: {
        status: leave.status,
        reason: leave.reason,
        totalDays: leave.totalDays,
        leaveType: leave.leaveType.name,
        user: `${leave.user.firstName} ${leave.user.lastName}`,
        email: leave.user.email,
      },
      backgroundColor: getEventColor(leave.status),
      borderColor: getEventBorderColor(leave.status),
      textColor: getEventTextColor(leave.status),
      allDay: true,
    })) || [];

  // Get colors based on leave status
  function getEventColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "#d1fae5"; // light green
      case LeaveStatus.PENDING:
        return "#fef3c7"; // light yellow
      case LeaveStatus.REJECTED:
        return "#fee2e2"; // light red
      case LeaveStatus.CANCELLED:
        return "#f3f4f6"; // light gray
      default:
        return "#e5e7eb"; // default light gray
    }
  }

  function getEventBorderColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "#10b981"; // green
      case LeaveStatus.PENDING:
        return "#f59e0b"; // yellow
      case LeaveStatus.REJECTED:
        return "#ef4444"; // red
      case LeaveStatus.CANCELLED:
        return "#9ca3af"; // gray
      default:
        return "#6b7280"; // default gray
    }
  }

  function getEventTextColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "#065f46"; // dark green
      case LeaveStatus.PENDING:
        return "#92400e"; // dark yellow
      case LeaveStatus.REJECTED:
        return "#b91c1c"; // dark red
      case LeaveStatus.CANCELLED:
        return "#4b5563"; // dark gray
      default:
        return "#1f2937"; // default dark gray
    }
  }

  // Handle calendar event click
  const handleEventClick = (info: any) => {
    const event = info.event;
    const { status, reason, totalDays, leaveType, user, email } =
      event.extendedProps;
    const leaveApplication = leaveApplications?.find(
      (leave) => leave.id === parseInt(event.id)
    );

    if (
      status === LeaveStatus.PENDING &&
      canModifyApplication() &&
      leaveApplication
    ) {
      toast.custom(
        (t) => (
          <div className="bg-white shadow-lg rounded-lg p-4 max-w-md">
            <h3 className="font-bold">{user}'s Leave</h3>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-sm mt-2">
              <span className="font-semibold">Type:</span> {leaveType}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Duration:</span> {event.startStr}{" "}
              to {event.endStr}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Days:</span> {totalDays}
            </p>
            <p className="text-sm mb-4">
              <span className="font-semibold">Reason:</span> {reason}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleApprove(leaveApplication);
                  toast.dismiss(t.id);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  handleReject(leaveApplication);
                  toast.dismiss(t.id);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-200 px-3 py-1 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    } else {
      toast(
        <div>
          <p className="font-bold">{user}</p>
          <p className="text-sm">{email}</p>
          <p className="text-sm">
            <span className="font-semibold">Type:</span> {leaveType}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Status:</span> {status}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Days:</span> {totalDays}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Reason:</span> {reason}
          </p>
        </div>,
        {
          duration: 4000,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            padding: "16px",
          },
        }
      );
    }
  };

  // Get all unique users from applications
  const uniqueUsers = leaveApplications
    ? Array.from(
        new Set(
          leaveApplications.map((app) =>
            JSON.stringify({
              id: app.user.id,
              name: `${app.user.firstName} ${app.user.lastName}`,
            })
          )
        )
      )
        .map((str) => JSON.parse(str))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 px-4 text-red-500">
        Error loading leave applications
      </div>
    );
  }

  return (
    <>
      {/* Status and User Filters */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          All Leave Applications
        </h1>
        <p className="text-gray-600">
          View and manage all leave applications in the system
        </p>
      </div>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-4 w-full">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-4 py-1 text-sm rounded-md ${
                selectedStatus === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus(LeaveStatus.PENDING)}
              className={`px-4 py-1 text-sm rounded-md ${
                selectedStatus === LeaveStatus.PENDING
                  ? "bg-indigo-600 text-white"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedStatus(LeaveStatus.APPROVED)}
              className={`px-4 py-1 text-sm rounded-md ${
                selectedStatus === LeaveStatus.APPROVED
                  ? "bg-indigo-600 text-white"
                  : "bg-green-100 text-green-800"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setSelectedStatus(LeaveStatus.REJECTED)}
              className={`px-4 py-1 text-sm rounded-md ${
                selectedStatus === LeaveStatus.REJECTED
                  ? "bg-indigo-600 text-white"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setSelectedStatus(LeaveStatus.CANCELLED)}
              className={`px-4 py-1 text-sm rounded-md ${
                selectedStatus === LeaveStatus.CANCELLED
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* User Filter */}
          <div className="flex items-center">
            <div className="mr-2 text-sm text-gray-700">
              Filter by employee:
            </div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={selectedUser || ""}
              onChange={(e) =>
                setSelectedUser(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">All Employees</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {selectedUser && (
              <button
                onClick={() => setSelectedUser(null)}
                className="ml-2 text-sm text-indigo-600 hover:text-indigo-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 flex items-center ${
              view === "list"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiList className="mr-2" /> List View
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 flex items-center ${
              view === "calendar"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiCalendar className="mr-2" /> Calendar View
          </button>
        </div>
      </div>
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Leaves Card */}
        <div className="bg-amber-500 text-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
            <FiClock className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">PENDING LEAVES</h3>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
        </div>

        {/* Approved Leaves Card */}
        <div className="bg-green-500 text-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
            <FiCheckSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">APPROVED LEAVES</h3>
            <p className="text-3xl font-bold">{approvedCount}</p>
          </div>
        </div>

        {/* Rejected Leaves Card */}
        <div className="bg-red-500 text-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
            <FiAlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">REJECTED LEAVES</h3>
            <p className="text-3xl font-bold">{rejectedCount}</p>
          </div>
        </div>

        {/* Cancelled Leaves Card */}
        <div className="bg-gray-500 text-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
            <FiX className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">CANCELLED LEAVES</h3>
            <p className="text-3xl font-bold">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && leaveApplications && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.35}
          />
        </div>
      )}

      {/* List View */}
      {view === "list" && leaveApplications && leaveApplications.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Leave Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Days
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <FiUser className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.user.firstName}{" "}
                            {application.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.leaveType.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.startDate} - {application.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.totalDays}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-500 max-w-[200px] truncate"
                        title={application.reason}
                      >
                        {application.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {application.status === LeaveStatus.PENDING &&
                        canModifyApplication() && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(application)}
                              className="text-green-500 hover:text-green-700"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(application)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        view === "list" && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No leave applications found</p>
          </div>
        )
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Leave Application"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Are you sure you want to approve this leave application?
          </p>
          <div className="space-y-2 bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Employee:</span>{" "}
              {selectedApplication?.user.firstName}{" "}
              {selectedApplication?.user.lastName}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Leave Type:</span>{" "}
              {selectedApplication?.leaveType.name}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Duration:</span>{" "}
              {selectedApplication?.startDate} - {selectedApplication?.endDate}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Days:</span>{" "}
              {selectedApplication?.totalDays}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments (Optional)
          </label>
          <div className="flex items-start">
            <div className="mt-1 w-10 flex-shrink-0">
              <FiMessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={3}
              placeholder="Add any comments about this approval..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowApproveModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={submitApproval}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Leave Application"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Please provide a reason for rejecting this leave application.
          </p>
          <div className="space-y-2 bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Employee:</span>{" "}
              {selectedApplication?.user.firstName}{" "}
              {selectedApplication?.user.lastName}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Leave Type:</span>{" "}
              {selectedApplication?.leaveType.name}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Duration:</span>{" "}
              {selectedApplication?.startDate} - {selectedApplication?.endDate}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Days:</span>{" "}
              {selectedApplication?.totalDays}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start">
            <div className="mt-1 w-10 flex-shrink-0">
              <FiMessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={3}
              placeholder="Explain why this leave application is being rejected..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            ></textarea>
          </div>
          {comments.trim() === "" && (
            <p className="mt-1 text-sm text-red-500">
              A reason is required for rejection.
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowRejectModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={submitRejection}
            disabled={rejectMutation.isPending || comments.trim() === ""}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>
    </>
  );
}
