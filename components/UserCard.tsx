import React from 'react';
import { User, UserRole, BreakStatus } from '../types';
import { MAX_BREAKS, DEFAULT_BREAK_DURATION_MINUTES } from '../constants';
import Timer from './Timer';

interface UserCardProps {
  user: User;
  isCurrentUser?: boolean;
  isAdminView?: boolean;
  isNewRequest?: boolean;
  breakDuration?: number;
  onRequest?: (userId: string) => void;
  onCancel?: (userId: string) => void;
  onApprove?: (userId: string) => void;
  onDeny?: (userId: string) => void;
}

const statusStyles: { [key in BreakStatus]: { border: string, bg: string, text: string, label: string } } = {
  [BreakStatus.Available]: { border: 'border-green-500', bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', label: 'Available' },
  [BreakStatus.Requested]: { border: 'border-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', label: 'Requested' },
  [BreakStatus.OnBreak]: { border: 'border-blue-500', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', label: 'On Break' },
};

const UserCard: React.FC<UserCardProps> = ({ user, isCurrentUser, isAdminView, isNewRequest, breakDuration, onRequest, onCancel, onApprove, onDeny }) => {
  const breaksLeft = MAX_BREAKS - user.breaksTaken;
  const hasBreaksLeft = breaksLeft > 0;
  
  const canRequest = user.breakStatus === BreakStatus.Available && hasBreaksLeft && onRequest;

  const renderAdminActions = () => {
    if (isAdminView && user.breakStatus === BreakStatus.Requested && onApprove && onDeny) {
      return (
        <div className="flex justify-center space-x-3 mt-4">
          <button onClick={() => onDeny(user.id)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-500">Deny</button>
          <button onClick={() => onApprove(user.id)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-500">Approve</button>
        </div>
      );
    }
    return null;
  };

  const renderEmployeeActions = () => {
    if (isCurrentUser && user.role === UserRole.Employee) {
      if (canRequest && onRequest) {
        return <button onClick={() => onRequest(user.id)} className="w-full mt-4 px-4 py-3 font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">Request {breakDuration || DEFAULT_BREAK_DURATION_MINUTES} Min Break</button>;
      }
      if (user.breakStatus === BreakStatus.Requested && onCancel) {
        return <button onClick={() => onCancel(user.id)} className="w-full mt-4 px-4 py-3 font-bold text-white bg-yellow-500 rounded-lg shadow-lg hover:bg-yellow-600 transition-colors duration-200">Cancel Request</button>;
      }
    }
    return null;
  };

  const cardBorderStyle = isNewRequest
    ? 'border-indigo-500 animate-pulse'
    : statusStyles[user.breakStatus].border;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border-l-4 ${cardBorderStyle} flex flex-col justify-between transition-all duration-300`}>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[user.breakStatus].bg} ${statusStyles[user.breakStatus].text}`}>
            {statusStyles[user.breakStatus].label}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
        
        {user.role === UserRole.Employee && (
            <div className={`mt-3 text-sm font-medium ${hasBreaksLeft ? 'text-slate-600 dark:text-slate-300' : 'text-red-500'}`}>
                Breaks remaining: {breaksLeft} / {MAX_BREAKS}
            </div>
        )}
      </div>

      <div className="mt-4">
        {user.breakStatus === BreakStatus.OnBreak && user.breakEndTime && <Timer breakEndTime={user.breakEndTime} />}
        {renderAdminActions()}
        {renderEmployeeActions()}
        {!hasBreaksLeft && isCurrentUser && user.breakStatus === BreakStatus.Available && (
             <p className="mt-4 text-center text-red-500 font-semibold">No breaks left for today.</p>
        )}
      </div>
    </div>
  );
};

export default UserCard;