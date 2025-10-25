import React, { useState } from 'react';
import { User, BreakStatus, UserRole } from '../types';
import UserCard from './UserCard';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdminDashboardProps {
  users: User[];
  onApproveBreak: (userId: string) => void;
  onDenyBreak: (userId: string) => void;
  newRequestIds: string[];
  breakDuration: number;
  onBreakDurationChange: (duration: number) => void;
  onAddTask: (userId: string, taskText: string, dueDate: string | null) => void;
}

type AdminView = 'status' | 'analytics';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onApproveBreak, onDenyBreak, newRequestIds, breakDuration, onBreakDurationChange, onAddTask }) => {
  const [view, setView] = useState<AdminView>('status');

  const pendingRequests = users.filter(u => u.role === UserRole.Employee && u.breakStatus === BreakStatus.Requested);
  const otherEmployees = users.filter(u => u.role === UserRole.Employee && u.breakStatus !== BreakStatus.Requested);

  const TabButton: React.FC<{ currentView: AdminView, viewName: AdminView, setView: (view: AdminView) => void, children: React.ReactNode }> = ({ currentView, viewName, setView, children }) => (
    <button
      onClick={() => setView(viewName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md ${currentView === viewName ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Controls</h2>
            <div className="flex items-center space-x-4 mt-2">
              <label htmlFor="break-duration" className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Break Duration:
              </label>
              <input
                id="break-duration"
                type="number"
                value={breakDuration}
                onChange={(e) => onBreakDurationChange(parseInt(e.target.value, 10))}
                min="1"
                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
               <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg">
             <TabButton currentView={view} viewName="status" setView={setView}>Team Status</TabButton>
             <TabButton currentView={view} viewName="analytics" setView={setView}>Analytics</TabButton>
          </div>
      </div>

      {view === 'status' ? (
        <>
          {pendingRequests.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white border-b-2 border-indigo-500 pb-2">Pending Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {pendingRequests.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isAdminView={true}
                    onApprove={onApproveBreak}
                    onDeny={onDenyBreak}
                    isNewRequest={newRequestIds.includes(user.id)}
                    onAddTask={onAddTask}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white border-b-2 border-slate-500 pb-2">Team Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {otherEmployees.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  isAdminView={true}
                  onAddTask={onAddTask}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <AnalyticsDashboard users={users.filter(u => u.role === UserRole.Employee)} />
      )}
    </div>
  );
};

export default AdminDashboard;
