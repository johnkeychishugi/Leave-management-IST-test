'use client';

import React from 'react';
import ProfileForm from '../../../components/users/ProfileForm';

const ProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow-sm">
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage; 