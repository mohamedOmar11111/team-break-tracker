export enum UserRole {
  Admin = 'Admin',
  Employee = 'Employee',
}

export enum BreakStatus {
  Available = 'Available',
  Requested = 'Requested',
  OnBreak = 'On Break',
  Offline = 'Offline',
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  completionDate: number | null;
}

export interface Break {
  startTime: number;
  durationMinutes: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  breakStatus: BreakStatus;
  breaks: Break[];
  breakEndTime: number | null;
  tasks: Task[];
}
