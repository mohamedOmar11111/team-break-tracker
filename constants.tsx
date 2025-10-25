import { User, UserRole, BreakStatus } from './types';

export const DEFAULT_BREAK_DURATION_MINUTES = 15;
export const MAX_BREAKS = 3;

// Helper to generate passwords
const generatePassword = (name: string) => {
    const firstName = name.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1) + '123';
};


export const INITIAL_USERS: User[] = [
  // Admins
  { id: '1', name: 'Atef', role: UserRole.Admin, password: generatePassword('Atef'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '2', name: 'Ali', role: UserRole.Admin, password: generatePassword('Ali'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '3', name: 'Fadl', role: UserRole.Admin, password: generatePassword('Fadl'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '4', name: 'Fathy', role: UserRole.Admin, password: generatePassword('Fathy'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  // Employees
  { id: '5', name: 'Abdo Sayed', role: UserRole.Employee, password: generatePassword('Abdo'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '6', name: 'Mahmoud Waheed', role: UserRole.Employee, password: generatePassword('Mahmoud'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '7', name: 'Naira Ashraf', role: UserRole.Employee, password: generatePassword('Naira'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '8', name: 'Mo Esam', role: UserRole.Employee, password: generatePassword('Mo'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '9', name: 'obaid', role: UserRole.Employee, password: generatePassword('Obaid'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '10', name: 'Abdelrahman Galal', role: UserRole.Employee, password: generatePassword('Abdelrahman'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '11', name: 'Ahmed Amir', role: UserRole.Employee, password: generatePassword('Ahmed'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '12', name: 'Ahmed Gamal', role: UserRole.Employee, password: generatePassword('Ahmed'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '13', name: 'Eman Gamal', role: UserRole.Employee, password: generatePassword('Eman'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '14', name: 'Abdallh Refaat', role: UserRole.Employee, password: generatePassword('Abdallh'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '15', name: 'Ahmed Hany', role: UserRole.Employee, password: generatePassword('Ahmed'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '16', name: 'Hossam Ehab', role: UserRole.Employee, password: generatePassword('Hossam'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '17', name: 'Shahd Nabil', role: UserRole.Employee, password: generatePassword('Shahd'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '18', name: 'Nedal Elsobky', role: UserRole.Employee, password: generatePassword('Nedal'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '19', name: 'Rahma Seif', role: UserRole.Employee, password: generatePassword('Rahma'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '20', name: 'Hana Khaled', role: UserRole.Employee, password: generatePassword('Hana'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
  { id: '21', name: 'Youssry', role: UserRole.Employee, password: generatePassword('Youssry'), breakStatus: BreakStatus.Offline, breaks: [], breakEndTime: null, tasks: [] },
];

export const HandRaisedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 15v-3m0 0V9h4v3m-4 0h4" />
    </svg>
);

export const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const BellSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.436a4.5 4.5 0 01-1.423.864M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1m-6 0H4l1.405-1.405A2.032 2.032 0 016 14.158V11a6.002 6.002 0 00-1.09-3.53m-1.41-1.41L3 4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
);