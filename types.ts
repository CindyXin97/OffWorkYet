
export interface UserProfile {
  name: string;
  riceName: string;
  password?: string;
  email?: string;
  city: string;
  jobTitle: string;
  company: string;
  monthlySalary: number;
  workingDaysPerMonth: number;
  isRegistered: boolean;
}

export interface WorkSession {
  startTime: number | null;
  dayStartTime: string | null;
  totalElapsedMs: number;
  isActive: boolean;
  date: string;
}

export interface DailyLog {
  date: string;
  hoursWorked: number;
  hourlyRate: number;
  vibe: 'Sushi' | 'Salad' | 'Bread';
  shifts: number;
  startTimeStr?: string;
  endTimeStr?: string;
}

export interface PeerLog {
  id: string;
  name: string;
  company: string;
  jobTitle: string;
  hoursWorked: number;
  hourlyRate: number;
  vibe: 'Sushi' | 'Salad' | 'Bread';
}
