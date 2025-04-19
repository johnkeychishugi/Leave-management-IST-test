import apiClient from './apiClient';
import { LoginRequest, LoginResponse, SignupRequest, User, MicrosoftAuthRequest } from './types';
  
export const AuthService = {  
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    const { token, userId, firstName, lastName, email, roles, profilePictureUrl } = response.data;
    
    localStorage.setItem('token', token);
    if (userId) localStorage.setItem('userId', userId.toString());
    if (firstName) localStorage.setItem('firstName', firstName);
    if (lastName) localStorage.setItem('lastName', lastName);
    if (email) localStorage.setItem('email', email);
    if (roles) localStorage.setItem('roles', JSON.stringify(roles));
    if (profilePictureUrl) localStorage.setItem('profilePictureUrl', profilePictureUrl);
    
    return response.data;
  },

  register: async (userData: SignupRequest): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/register', userData);
    return data;
  },

  microsoftAuth: async (userData: MicrosoftAuthRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/microsoft', userData);
    const { token, userId, firstName, lastName, email, roles, profilePictureUrl } = response.data;


    localStorage.setItem('token', token);
    if (userId) localStorage.setItem('userId', userId.toString());
    if (firstName) localStorage.setItem('firstName', firstName);
    if (lastName) localStorage.setItem('lastName', lastName);
    if (email) localStorage.setItem('email', email);
    if (roles) localStorage.setItem('roles', JSON.stringify(roles));
    if (profilePictureUrl) localStorage.setItem('profilePictureUrl', profilePictureUrl);

   
    return response.data;
  },

  refreshUserData: async (): Promise<User> => {
   // get user data from local storage
   const userId = localStorage.getItem('userId');
   const firstName = localStorage.getItem('firstName');
   const lastName = localStorage.getItem('lastName');
   const email = localStorage.getItem('email');
   const roles = localStorage.getItem('roles');
   const profilePictureUrl = localStorage.getItem('profilePictureUrl');
   

   return {
    id: parseInt(userId || '0'),
    firstName: firstName || '',
    lastName: lastName || '',
    fullName: `${firstName} ${lastName}`,
    email: email || '',
    roles: roles ? JSON.parse(roles) : [],
    profilePictureUrl: profilePictureUrl || undefined
   };
  }
};

export default AuthService; 