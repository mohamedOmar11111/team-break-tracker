
import React from 'react';
import { User } from '../types';

interface UserSelectionProps {
  users: User[];
  onLogin: (userId: string) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ users, onLogin }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Who are you?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onLogin(user.id)}
            className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-200 dark:bg-indigo-500 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-indigo-700 dark:text-white">{user.name.charAt(0)}</span>
            </div>
            <span className="text-center font-semibold text-sm">{user.name}</span>
            <span className="text-center text-xs text-slate-500 dark:text-slate-400">{user.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelection;
