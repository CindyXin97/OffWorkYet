
import React from 'react';
import { PeerLog } from './types';

export const TARGET_WORK_HOURS = 8;
export const WORKING_DAYS_PER_MONTH = 22;

// 基于美国科技公司市场薪资数据 (2025-2026)
// TC = Total Compensation, 计算方式: monthly_salary / 22 days / hours_worked
export const MOCK_PEERS: PeerLog[] = [
  // Meta E5 Senior SWE: ~$420k TC (~$19k/month, $864/day)
  { id: '1', name: 'kev99', company: 'Meta', jobTitle: 'Senior SWE (E5)', hoursWorked: 5.5, hourlyRate: 157, vibe: 'Sushi' },
  // Google L5 Senior SWE: ~$380k TC (~$17.3k/month, $786/day)  
  { id: '2', name: 'sarah_z', company: 'Google', jobTitle: 'Senior SWE (L5)', hoursWorked: 7.5, hourlyRate: 105, vibe: 'Salad' },
  // Snap Senior Product Designer: ~$280k TC (~$12.7k/month, $578/day)
  { id: '3', name: 'jasonL', company: 'Snap', jobTitle: 'Sr. Product Designer', hoursWorked: 9, hourlyRate: 64, vibe: 'Bread' },
  // Stripe Staff Engineer: ~$500k TC (~$22.7k/month, $1032/day)
  { id: '4', name: 'michhh', company: 'Stripe', jobTitle: 'Staff Engineer', hoursWorked: 4, hourlyRate: 258, vibe: 'Sushi' },
  // Netflix Senior SWE: ~$450k TC (~$20.5k/month, $930/day)
  { id: '5', name: 'dave_w', company: 'Netflix', jobTitle: 'Senior SWE', hoursWorked: 10, hourlyRate: 93, vibe: 'Bread' },
  // Apple ICT4 SWE: ~$320k TC (~$14.5k/month, $661/day)
  { id: '6', name: 'emilyC', company: 'Apple', jobTitle: 'SWE (ICT4)', hoursWorked: 8, hourlyRate: 83, vibe: 'Salad' },
  // Amazon L6 SDE: ~$350k TC (~$15.9k/month, $723/day)
  { id: '7', name: 'chris007', company: 'Amazon', jobTitle: 'SDE II (L6)', hoursWorked: 11, hourlyRate: 66, vibe: 'Bread' },
  // Microsoft L63 SWE: ~$300k TC (~$13.6k/month, $620/day)
  { id: '8', name: 'lisaW', company: 'Microsoft', jobTitle: 'SWE II (63)', hoursWorked: 6, hourlyRate: 103, vibe: 'Sushi' },
];

// Market benchmark data (standard 8-hour rate)
export const MOCK_NETWORK = [
  { company: 'Meta', role: 'Senior SWE (E5)', baseRate: 108, vibe: 'High' },
  { company: 'Google', role: 'Senior SWE (L5)', baseRate: 98, vibe: 'High' },
  { company: 'Stripe', role: 'Staff Engineer', baseRate: 129, vibe: 'High' },
  { company: 'Netflix', role: 'Senior SWE', baseRate: 116, vibe: 'High' },
  { company: 'Apple', role: 'SWE (ICT4)', baseRate: 83, vibe: 'Medium' },
  { company: 'Amazon', role: 'SDE II (L6)', baseRate: 90, vibe: 'Medium' },
  { company: 'Microsoft', role: 'SWE II (63)', baseRate: 77, vibe: 'Medium' },
  { company: 'Snap', role: 'Sr. Product Designer', baseRate: 72, vibe: 'Medium' },
];
