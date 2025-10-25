import React from 'react';
import { User } from '../types';
import { isToday } from '../utils/dateUtils';

interface AnalyticsDashboardProps {
  users: User[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ users }) => {

  const getOverallStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let totalBreaksToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    users.forEach(user => {
      totalTasks += user.tasks.length;
      completedTasks += user.tasks.filter(t => t.completed).length;
      overdueTasks += user.tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < today).length;
      totalBreaksToday += user.breaks.filter(b => isToday(b.startTime)).length;
    });

    return { totalTasks, completedTasks, overdueTasks, totalBreaksToday };
  };

  const stats = getOverallStats();

  const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Overall Performance Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Breaks Taken" value={stats.totalBreaksToday} description="Across all employees today." />
          <StatCard title="Completed Tasks" value={stats.completedTasks} description="All completed tasks." />
          <StatCard title="Pending Tasks" value={stats.totalTasks - stats.completedTasks} description="Tasks not yet completed." />
          <StatCard title="Overdue Tasks" value={stats.overdueTasks} description="Tasks past their due date." />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Employee Details</h2>
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Breaks Today</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tasks Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tasks Pending</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tasks Overdue</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {users.map(user => {
                const breaksToday = user.breaks.filter(b => isToday(b.startTime)).length;
                const tasksCompleted = user.tasks.filter(t => t.completed).length;
                const tasksPending = user.tasks.length - tasksCompleted;
                const today = new Date();
                today.setHours(0,0,0,0);
                const tasksOverdue = user.tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < today).length;

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{breaksToday}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{tasksCompleted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{tasksPending}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tasksOverdue > 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-300'}`}>{tasksOverdue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
