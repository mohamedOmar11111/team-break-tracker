
import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import UserSelection from './components/UserSelection';
import useLocalStorage from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import ToastContainer from './components/ToastContainer';
import { User, UserRole, BreakStatus, Task } from './types';
import { INITIAL_USERS, DEFAULT_BREAK_DURATION_MINUTES, MAX_BREAKS, BellIcon, BellSlashIcon } from './constants';
import { isToday } from './utils/dateUtils';

interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

function App() {
  const [users, setUsers] = useLocalStorage<User[]>('break-tracker-users', INITIAL_USERS);
  const [breakDuration, setBreakDuration] = useLocalStorage<number>('break-duration', DEFAULT_BREAK_DURATION_MINUTES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { permission, requestPermission, showNotification } = useNotifications();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevUsersRef = useRef<User[]>(users);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());
  const [endingSoonNotified, setEndingSoonNotified] = useLocalStorage<string[]>('break-tracker-ending-soon', []);

  const notify = useCallback((payload: object) => {
    localStorage.setItem('break-tracker-notifications', JSON.stringify({ ...payload, timestamp: Date.now() }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let usersChanged = false;
      const now = Date.now();
      const notifiedSet = new Set(endingSoonNotified);
      let notifiedSetChanged = false;

      const updatedUsers = users.map(user => {
        if (user.breakStatus === BreakStatus.OnBreak && user.breakEndTime) {
          const timeLeft = user.breakEndTime - now;

          // Notify if < 60s left and not already notified
          if (timeLeft > 0 && timeLeft <= 60 * 1000 && !notifiedSet.has(user.id)) {
            notify({
              targetUserId: user.id,
              title: 'Break Ending Soon',
              body: 'Your break will end in about one minute.'
            });
            notifiedSet.add(user.id);
            notifiedSetChanged = true;
          }

          if (timeLeft <= 0) {
            usersChanged = true;
            notify({
              targetUserId: user.id,
              title: 'Break time is over!',
              body: 'Time to get back to work.'
            });
            if (notifiedSet.has(user.id)) {
                notifiedSet.delete(user.id);
                notifiedSetChanged = true;
            }
            return { ...user, breakStatus: BreakStatus.Available, breakEndTime: null };
          }
        }
        return user;
      });

      if (usersChanged) {
        setUsers(updatedUsers);
      }

      if (notifiedSetChanged) {
        setEndingSoonNotified(Array.from(notifiedSet));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [users, setUsers, notify, endingSoonNotified, setEndingSoonNotified]);

  useEffect(() => {
    const handleNotificationEvents = (e: StorageEvent) => {
      if (e.key === 'break-tracker-notifications' && e.newValue) {
        try {
            const notification = JSON.parse(e.newValue);
            if (currentUser) {
                if (notification.targetUserId && currentUser.id === notification.targetUserId) {
                  showNotification(notification.title, { body: notification.body });
                }
                if (notification.targetRole && currentUser.role === notification.targetRole) {
                    if (notification.sourceUserId !== currentUser.id) {
                        showNotification(notification.title, { body: notification.body });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to parse notification event", error);
        }
      }
    };
    window.addEventListener('storage', handleNotificationEvents);
    return () => window.removeEventListener('storage', handleNotificationEvents);
  }, [currentUser, showNotification]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  useEffect(() => {
    if (currentUser?.role === UserRole.Admin) {
      const newRequests = users.filter(user => 
        user.breakStatus === BreakStatus.Requested && 
        !prevUsersRef.current.some(prevUser => prevUser.id === user.id && prevUser.breakStatus === BreakStatus.Requested)
      );
      
      newRequests.forEach(user => {
        addToast(`${user.name} has requested a break.`, 'info');
        setNewRequestIds(prev => {
          const newSet = new Set(prev);
          newSet.add(user.id);
          return newSet;
        });
        setTimeout(() => {
            setNewRequestIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
            });
        }, 5000);
      });

      const finishedBreaks = prevUsersRef.current.filter(prevUser =>
        prevUser.breakStatus === BreakStatus.OnBreak &&
        users.some(user => user.id === prevUser.id && user.breakStatus === BreakStatus.Available)
      );

      finishedBreaks.forEach(user => {
        addToast(`${user.name}'s break has ended.`, 'info');
      });
    }
    prevUsersRef.current = users;
  }, [users, currentUser]);

  const handleLogin = (username: string, password?: string) => {
    // Trim and compare names case-insensitively for better UX
    const user = users.find(u => u.name.toLowerCase() === username.toLowerCase().trim());
    if (user && user.password === password) {
      setCurrentUser(user);
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === user.id ? { ...u, breakStatus: BreakStatus.Available } : u
      ));
      addToast(`Welcome, ${user.name}!`, 'success');
    } else {
        addToast('Invalid credentials. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
       setUsers(prevUsers => prevUsers.map(u => 
        u.id === currentUser.id ? { ...u, breakStatus: BreakStatus.Offline } : u
      ));
      setCurrentUser(null);
    }
  };
  
  const handleResetData = () => {
    if(window.confirm('Are you sure you want to reset all data? This will log everyone out and reset all breaks and tasks.')) {
      localStorage.removeItem('break-tracker-users');
      localStorage.removeItem('break-tracker-notifications');
      localStorage.removeItem('break-duration');
      localStorage.removeItem('break-tracker-ending-soon');
      setUsers(INITIAL_USERS);
      setBreakDuration(DEFAULT_BREAK_DURATION_MINUTES);
      setCurrentUser(null);
    }
  }

  const handleRequestBreak = (userId: string) => {
    const userRequesting = users.find(u => u.id === userId);
    if (!userRequesting) return;
    
    const breaksToday = userRequesting.breaks.filter(b => isToday(b.startTime)).length;

    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId && breaksToday < MAX_BREAKS && u.breakStatus === BreakStatus.Available
        ? { ...u, breakStatus: BreakStatus.Requested }
        : u
    ));
    
    notify({
        targetRole: UserRole.Admin,
        sourceUserId: userId,
        title: 'New Break Request',
        body: `${userRequesting.name} has requested a break.`
    });
  };
  
  const handleCancelRequest = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId && u.breakStatus === BreakStatus.Requested
      ? { ...u, breakStatus: BreakStatus.Available }
      : u
    ));
  };

  const handleApproveBreak = (userId: string) => {
    const userApproved = users.find(u => u.id === userId);
    if (!userApproved) return;
    
    const now = Date.now();
    const newBreak = { startTime: now, durationMinutes: breakDuration };

    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId
        ? {
          ...u,
          breakStatus: BreakStatus.OnBreak,
          breaks: [...u.breaks, newBreak],
          breakEndTime: now + breakDuration * 60 * 1000,
        }
        : u
    ));
    
    if (currentUser?.role === UserRole.Admin) {
      addToast(`Approved break for ${userApproved.name}.`, 'success');
    }

    notify({
        targetUserId: userId,
        sourceUserId: currentUser?.id,
        title: 'Break Approved!',
        body: `Your break request has been approved by ${currentUser?.name}.`
    });
  };
  
  const handleDenyBreak = (userId: string) => {
    const userDenied = users.find(u => u.id === userId);
    if (!userDenied) return;
    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId ? { ...u, breakStatus: BreakStatus.Available } : u
    ));

    if (currentUser?.role === UserRole.Admin) {
      addToast(`Denied break for ${userDenied.name}.`, 'info');
    }

    notify({
        targetUserId: userId,
        sourceUserId: currentUser?.id,
        title: 'Break Denied',
        body: `Your break request has been denied by ${currentUser?.name}.`
    });
  }
  
  const handleBreakDurationChange = (duration: number) => {
    if (duration > 0) {
      setBreakDuration(duration);
    }
  }

  const handleAddTask = (userId: string, taskText: string, dueDate: string | null) => {
    if (!taskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      dueDate: dueDate,
      completionDate: null,
    };

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, tasks: [...user.tasks, newTask] } : user
      )
    );
  };

  const handleToggleTask = (userId: string, taskId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              tasks: user.tasks.map(task => {
                if (task.id === taskId) {
                  const isCompleted = !task.completed;
                  return { ...task, completed: isCompleted, completionDate: isCompleted ? Date.now() : null };
                }
                return task;
              }),
            }
          : user
      )
    );
  };

  const loggedInUser = currentUser ? users.find(u => u.id === currentUser.id) : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Dashboard</h1>
            <div className="flex items-center space-x-4">
               {loggedInUser && (
                <>
                  {permission === 'granted' ? (
                      <div title="Notifications Enabled" className="p-2">
                          <BellIcon />
                      </div>
                  ) : (
                      <button onClick={requestPermission} title="Enable Notifications" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                          <BellSlashIcon />
                      </button>
                  )}
                </>
               )}
               {loggedInUser && loggedInUser.role === UserRole.Admin && (
                 <button onClick={handleResetData} className="text-sm text-red-500 hover:text-red-700">Reset Data</button>
               )}
               {loggedInUser && (
                <>
                  <span className="text-sm font-medium">Welcome, {loggedInUser.name}</span>
                  <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!loggedInUser ? (
          <UserSelection onLogin={handleLogin} />
        ) : loggedInUser.role === UserRole.Admin ? (
          <AdminDashboard
            users={users}
            onApproveBreak={handleApproveBreak}
            onDenyBreak={handleDenyBreak}
            newRequestIds={Array.from(newRequestIds)}
            breakDuration={breakDuration}
            onBreakDurationChange={handleBreakDurationChange}
            onAddTask={handleAddTask}
          />
        ) : (
          <EmployeeDashboard
            currentUser={loggedInUser}
            onRequestBreak={handleRequestBreak}
            onCancelRequest={handleCancelRequest}
            breakDuration={breakDuration}
            onToggleTask={handleToggleTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;
