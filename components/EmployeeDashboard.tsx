import React from 'react';
import { User } from '../types';
import UserCard from './UserCard';

interface EmployeeDashboardProps {
  currentUser: User;
  onRequestBreak: (userId: string) => void;
  onCancelRequest: (userId: string) => void;
  breakDuration: number;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ currentUser, onRequestBreak, onCancelRequest, breakDuration }) => {
  return (
    <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-900 dark:text-white">Your Status</h2>
        <UserCard
          user={currentUser}
          isCurrentUser={true}
          onRequest={onRequestBreak}
          onCancel={onCancelRequest}
          breakDuration={breakDuration}
        />
    </div>
  );
};

export default EmployeeDashboard;