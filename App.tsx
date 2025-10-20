import React, { useState, useEffect, useRef } from 'react';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminLogin from './components/AdminLogin';
import EmployeeLogin from './components/EmployeeLogin';
import { useNotifications } from './hooks/useNotifications';
import ToastContainer from './components/ToastContainer';
import { User, UserRole, BreakStatus } from './types';
import { INITIAL_USERS, DEFAULT_BREAK_DURATION_MINUTES, MAX_BREAKS, BellIcon, BellSlashIcon } from './constants';

interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [breakDuration, setBreakDuration] = useState<number>(DEFAULT_BREAK_DURATION_MINUTES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { permission, requestPermission, showNotification } = useNotifications();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevUsersRef = useRef<User[]>(users);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());
  const [route, setRoute] = useState(window.location.hash);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'INIT' || type === 'UPDATE') {
        setUsers(payload.users);
        setBreakDuration(payload.breakDuration);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const now = Date.now();
      const updatedUsers = users.map(user => {
        if (user.breakStatus === BreakStatus.OnBreak && user.breakEndTime && user.breakEndTime <= now) {
          changed = true;
          if (currentUser && currentUser.id === user.id) {
            showNotification('Break time is over!', { body: 'Time to get back to work.' });
          }
          return { ...user, breakStatus: BreakStatus.Available, breakEndTime: null };
        }
        return user;
      });
      if (changed) {
        // This should be handled by the server, but we'll leave it for now
        // to ensure timers are still working correctly on the client side.
        setUsers(updatedUsers);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [users, setUsers, currentUser, showNotification]);

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

  const sendMessage = (type: string, payload: any) => {
    ws.current?.send(JSON.stringify({ type, payload }));
  };

  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      window.location.hash = '';
    } else {
      addToast('Invalid username or password', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleResetData = () => {
    if(window.confirm('Are you sure you want to reset all data? This will log everyone out and reset all breaks.')) {
      sendMessage('RESET_DATA', {});
    }
  }

  const handleRequestBreak = (userId: string) => {
    sendMessage('REQUEST_BREAK', { userId });
  };

  const handleCancelRequest = (userId: string) => {
    sendMessage('CANCEL_REQUEST', { userId });
  };

  const handleApproveBreak = (userId: string) => {
    sendMessage('APPROVE_BREAK', { userId });
  };

  const handleDenyBreak = (userId: string) => {
    sendMessage('DENY_BREAK', { userId });
  }

  const handleBreakDurationChange = (duration: number) => {
    if (duration > 0) {
      sendMessage('CHANGE_BREAK_DURATION', { duration });
    }
  }

  const loggedInUser = currentUser ? users.find(u => u.id === currentUser.id) : null;

  const renderContent = () => {
    if (loggedInUser) {
      if (loggedInUser.role === UserRole.Admin) {
        return (
          <AdminDashboard
            users={users}
            onApproveBreak={handleApproveBreak}
            onDenyBreak={handleDenyBreak}
            newRequestIds={Array.from(newRequestIds)}
            breakDuration={breakDuration}
            onBreakDurationChange={handleBreakDurationChange}
          />
        );
      } else {
        return (
          <EmployeeDashboard
            currentUser={loggedInUser}
            onRequestBreak={handleRequestBreak}
            onCancelRequest={handleCancelRequest}
            breakDuration={breakDuration}
          />
        );
      }
    }

    if (route === '#admin-login') {
      return <AdminLogin onLogin={handleLogin} />;
    }

    if (route === '#employee-login') {
      return <EmployeeLogin onLogin={handleLogin} />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Team Break Tracker</h1>
          <div className="space-x-4">
            <a href="#admin-login" className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500">
              Admin Login
            </a>
            <a href="#employee-login" className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-500">
              Employee Login
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Break Tracker</h1>
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
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
