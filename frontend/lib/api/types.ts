// User types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role?: string;
  roles?: string[];
  department?: Department;
  manager?: User;
  active?: boolean;
  profilePictureUrl?: string;
  employmentDate?: string;
  microsoftId?: string;
  phoneNumber?: string;
  preferredTheme?: string;
  notificationPreferences?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
}

// Department types
export interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: User;
  users?: User[];
  createdAt?: string;
  updatedAt?: string;
}

// Leave types
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  defaultDays?: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveBalance {
  id: number;
  user: User;
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carriedOverDays: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveApplication {
  id: number;
  user: User;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: User;
  approvalDate?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  profilePictureUrl?: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface MicrosoftAuthRequest {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  profilePictureUrl?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Add new Notification type
export enum NotificationType {
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVAL = 'LEAVE_APPROVAL',
  LEAVE_REJECTION = 'LEAVE_REJECTION',
  LEAVE_CANCELLATION = 'LEAVE_CANCELLATION',
  BALANCE_UPDATE = 'BALANCE_UPDATE',
  GENERAL = 'GENERAL'
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  data?: any;
  actionUrl?: string;
  actionText?: string;
}

// New types for profile and settings
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface UpdateSettingsRequest {
  preferredTheme?: string;
  notificationPreferences?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
} 