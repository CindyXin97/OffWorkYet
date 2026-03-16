
import React from 'react';
import { PeerLog } from './types';

export const TARGET_WORK_HOURS = 8;
export const WORKING_DAYS_PER_MONTH = 22;

export const MOCK_PEERS: PeerLog[] = [
  { id: '1', name: 'Alex', company: 'Meta', jobTitle: 'Senior SWE', hoursWorked: 6, hourlyRate: 85, vibe: 'Sushi' },
  // Fix: Type '"Toast"' is not assignable to type '"Sushi" | "Salad" | "Bread"'. 10h is Bread level.
  { id: '2', name: 'Jordan', company: 'Snap', jobTitle: 'Product Designer', hoursWorked: 10, hourlyRate: 32.5, vibe: 'Bread' },
  // Fix: Type '"Toast"' is not assignable to type '"Sushi" | "Salad" | "Bread"'. 8.5h is Bread level.
  { id: '3', name: 'Casey', company: 'Google', jobTitle: 'Marketing', hoursWorked: 8.5, hourlyRate: 45, vibe: 'Bread' },
  { id: '4', name: 'Taylor', company: 'Stripe', jobTitle: 'Backend Dev', hoursWorked: 4.5, hourlyRate: 110, vibe: 'Sushi' },
  { id: '5', name: 'Riley', company: 'Netflix', jobTitle: 'Senior SWE', hoursWorked: 12, hourlyRate: 28, vibe: 'Bread' },
];

export const MOCK_NETWORK = [
  { company: 'Meta', role: 'Senior SWE', baseRate: 85, vibe: 'High' },
  { company: 'Snap', role: 'Product Designer', baseRate: 62, vibe: 'Medium' },
  { company: 'Google', role: 'Senior SWE', baseRate: 72.5, vibe: 'High' },
];
