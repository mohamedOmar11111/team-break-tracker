
export enum UserRole {
  Admin = 'admin',
  Employee = 'employee',
}

export enum BreakStatus {
  Available = 'Available',
  Requested = 'Requested',
  OnBreak = 'On Break',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  breakStatus: BreakStatus;
  breaksTaken: number;
  breakEndTime: number | null;
}
