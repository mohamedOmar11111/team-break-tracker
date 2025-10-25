import React, { useState } from 'react';
import { User, UserRole, BreakStatus } from '../types';
import { MAX_BREAKS, DEFAULT_BREAK_DURATION_MINUTES } from '../constants';
import Timer from './Timer';
import { isToday } from '../utils/dateUtils';

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
  onAddTask?: (userId: string, taskText: string, dueDate: string | null) => void;
  onToggleTask?: (userId: string, taskId: string) => void;
}

const statusStyles: { [key in BreakStatus]: { border: string, bg: string, text: string, label: string } } = {
  [BreakStatus.Available]: { border: 'border-green-500', bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', label: 'Available' },
  [BreakStatus.Requested]: { border: 'border-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', label: 'Requested' },
  [BreakStatus.OnBreak]: { border: 'border-blue-500', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', label: 'On Break' },
  [BreakStatus.Offline]: { border: 'border-slate-400', bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', label: 'Offline' },
};

const UserCard: React.FC<UserCardProps> = ({ user, isCurrentUser, isAdminView, isNewRequest, breakDuration, onRequest, onCancel, onApprove, onDeny, onAddTask, onToggleTask }) => {
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  
  const breaksToday = user.breaks.filter(b => isToday(b.startTime)).length;
  const breaksLeft = MAX_BREAKS - breaksToday;
  const hasBreaksLeft = breaksLeft > 0;
  
  const canRequest = user.breakStatus === BreakStatus.Available && hasBreaksLeft && onRequest;

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTask && newTask.trim()) {
      onAddTask(user.id, newTask.trim(), newDueDate || null);
      setNewTask('');
      setNewDueDate('');
    }
  };

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

  const renderTasks = () => {
    if (user.role !== UserRole.Employee) return null;

    return (
      <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="font-semibold text-md text-slate-800 dark:text-slate-200 mb-2">Tasks</h4>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {user.tasks.length > 0 ? (
            user.tasks.map(task => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < today;

              return (
              <div key={task.id} className={`flex items-start transition-opacity duration-300 ${task.completed ? 'opacity-60' : 'opacity-100'}`}>
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onChange={() => onToggleTask && onToggleTask(user.id, task.id)}
                  disabled={!isCurrentUser}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 mt-1"
                />
                <div className="ml-3 flex-grow">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`block text-sm font-medium leading-tight ${
                      task.completed
                        ? 'text-slate-500 dark:text-slate-400 line-through'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {task.text}
                  </label>
                  {task.dueDate && (
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} {isOverdue && '(Overdue)'}
                    </p>
                  )}
                </div>
              </div>
            )})
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks assigned.</p>
          )}
        </div>
        {isAdminView && onAddTask && (
           <form onSubmit={handleAddTaskSubmit} className="mt-4 space-y-2">
             <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <div className="flex items-center space-x-2">
               <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-500 dark:text-slate-400"
                min={new Date().toISOString().split('T')[0]}
              />
              <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 whitespace-nowrap">Add Task</button>
            </div>
          </form>
        )}
      </div>
    );
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
        
        {user.role === UserRole.Employee && user.breakStatus !== BreakStatus.Offline && (
            <div className={`mt-3 text-sm font-medium ${hasBreaksLeft ? 'text-slate-600 dark:text-slate-300' : 'text-red-500'}`}>
                Breaks remaining today: {breaksLeft} / {MAX_BREAKS}
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
       {renderTasks()}
    </div>
  );
};

export default UserCard;
