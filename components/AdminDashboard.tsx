import React from 'react';
import { User, BreakStatus } from '../types';
import UserCard from './UserCard';

interface AdminDashboardProps {
  users: User[];
  onApproveBreak: (userId: string) => void;
  onDenyBreak: (userId: string) => void;
  newRequestIds: string[];
  breakDuration: number;
  onBreakDurationChange: (duration: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onApproveBreak, onDenyBreak, newRequestIds, breakDuration, onBreakDurationChange }) => {
  const pendingRequests = users.filter(u => u.breakStatus === BreakStatus.Requested);
  const otherEmployees = users.filter(u => u.breakStatus !== BreakStatus.Requested);

  return (
    <div>
      <div className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Settings</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="break-duration" className="font-medium text-slate-700 dark:text-slate-300">
            Break Duration (minutes):
          </label>
          <input
            id="break-duration"
            type="number"
            value={breakDuration}
            onChange={(e) => onBreakDurationChange(parseInt(e.target.value, 10))}
            min="1"
            className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white border-b-2 border-indigo-500 pb-2">Pending Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pendingRequests.map(user => (
              <UserCard
                key={user.id}
                user={user}
                isAdminView={true}
                onApprove={onApproveBreak}
                onDeny={onDenyBreak}
                isNewRequest={newRequestIds.includes(user.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white border-b-2 border-slate-500 pb-2">Team Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {otherEmployees.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isAdminView={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;