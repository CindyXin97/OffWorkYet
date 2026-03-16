import { UserProfile } from '../types';

const TARGET_WORK_HOURS = 8;

/**
 * 计算时薪（线性递减公式）
 * 0小时 → 日薪
 * 0-8小时 → 线性递减
 * 8小时 → 标准时薪
 * >8小时 → 继续递减
 */
export function calculateHourlyRate(dailyPay: number, hours: number): number {
  const standardRate = dailyPay / TARGET_WORK_HOURS;
  
  if (hours <= 0) {
    return Math.round(dailyPay);
  } else if (hours <= TARGET_WORK_HOURS) {
    const dropPerHour = (dailyPay - standardRate) / TARGET_WORK_HOURS;
    return Math.round(dailyPay - dropPerHour * hours);
  } else {
    return Math.round(dailyPay / hours);
  }
}

/**
 * 计算日薪
 */
export function calculateDailyPay(monthlySalary: number, workingDaysPerMonth: number): number {
  return monthlySalary / (workingDaysPerMonth || 22);
}

/**
 * 计算标准时薪（8小时）
 */
export function calculateStandardRate(dailyPay: number): number {
  return Math.round(dailyPay / TARGET_WORK_HOURS);
}

/**
 * 获取显示名字（优先 name，其次 riceName）
 */
export function getDisplayName(profile: UserProfile): string {
  return profile.name && profile.name !== 'User' ? profile.name : profile.riceName || 'Rice Ball';
}

/**
 * 根据工作时间获取 Vibe
 */
export function getVibe(hours: number): 'Sushi' | 'Salad' | 'Bread' {
  if (hours < 4 && hours > 0) return 'Sushi';
  if (hours >= 8) return 'Bread';
  return 'Salad';
}

/**
 * 计算每分钟下降金额
 */
export function getDropPerMinute(dailyPay: number): number {
  const standardRate = dailyPay / TARGET_WORK_HOURS;
  return (dailyPay - standardRate) / (TARGET_WORK_HOURS * 60);
}
