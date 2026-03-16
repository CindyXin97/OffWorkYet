/**
 * Frontend API using Supabase Auth + direct database access.
 * No separate backend needed!
 */

import { supabase } from './supabase';

// ----- Types -----
export interface UserProfileFromApi {
  name: string;
  riceName: string;
  city: string;
  jobTitle: string;
  company: string;
  monthlySalary: number;
  workingDaysPerMonth: number;
  isRegistered: true;
}

export interface WorkSessionFromApi {
  startTime: number | null;
  dayStartTime: string | null;
  totalElapsedMs: number;
  isActive: boolean;
  date: string;
}

export interface DailyLogFromApi {
  date: string;
  hoursWorked: number;
  hourlyRate: number;
  vibe: 'Sushi' | 'Salad' | 'Bread';
  shifts: number;
  startTimeStr?: string;
  endTimeStr?: string;
}

export interface PeerLogFromApi {
  id: string;
  name: string;
  company: string;
  jobTitle: string;
  hoursWorked: number;
  hourlyRate: number;
  vibe: 'Sushi' | 'Salad' | 'Bread';
}

// ----- Auth -----
export const auth = {
  async login(email: string, password: string): Promise<UserProfileFromApi> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');
    return await me.get();
  },

  async register(body: {
    email: string;
    password: string;
    riceName: string;
    name?: string;
    city?: string;
    jobTitle?: string;
    company?: string;
    monthlySalary?: number;
    workingDaysPerMonth?: number;
  }): Promise<UserProfileFromApi> {
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      rice_name: body.riceName,
      name: body.name || 'User',
      city: body.city || '',
      job_title: body.jobTitle || 'Senior SWE',
      company: body.company || 'Meta',
      monthly_salary: body.monthlySalary || 2200,
      working_days_per_month: body.workingDaysPerMonth || 22,
    });
    if (profileError) throw new Error(profileError.message);

    return await me.get();
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (user: unknown) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

// ----- Me (Profile) -----
export const me = {
  async get(): Promise<UserProfileFromApi> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    
    // If profile doesn't exist, create a default one
    if (!data) {
      const defaultProfile = {
        id: user.id,
        rice_name: user.email?.split('@')[0] || 'User',
        name: 'User',
        city: '',
        job_title: 'Senior SWE',
        company: 'Meta',
        monthly_salary: 2200,
        working_days_per_month: 22,
      };
      const { error: insertError } = await supabase.from('profiles').insert(defaultProfile);
      if (insertError) throw new Error(insertError.message);
      
      return {
        name: defaultProfile.name,
        riceName: defaultProfile.rice_name,
        city: defaultProfile.city,
        jobTitle: defaultProfile.job_title,
        company: defaultProfile.company,
        monthlySalary: defaultProfile.monthly_salary,
        workingDaysPerMonth: defaultProfile.working_days_per_month,
        isRegistered: true,
      };
    }

    return {
      name: data.name,
      riceName: data.rice_name,
      city: data.city,
      jobTitle: data.job_title,
      company: data.company,
      monthlySalary: data.monthly_salary,
      workingDaysPerMonth: data.working_days_per_month,
      isRegistered: true,
    };
  },

  async patch(body: Partial<UserProfileFromApi>): Promise<UserProfileFromApi> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.city !== undefined) updates.city = body.city;
    if (body.jobTitle !== undefined) updates.job_title = body.jobTitle;
    if (body.company !== undefined) updates.company = body.company;
    if (body.monthlySalary !== undefined) updates.monthly_salary = body.monthlySalary;
    if (body.workingDaysPerMonth !== undefined) updates.working_days_per_month = body.workingDaysPerMonth;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return await me.get();
  },
};

// ----- Sessions -----
function todayDateStr(): string {
  return new Date().toLocaleDateString();
}

export const sessions = {
  async getToday(): Promise<WorkSessionFromApi> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const date = todayDateStr();
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      return {
        startTime: null,
        dayStartTime: null,
        totalElapsedMs: 0,
        isActive: false,
        date,
      };
    }

    return {
      startTime: data.start_time_ts ? Number(data.start_time_ts) : null,
      dayStartTime: data.day_start_time_str,
      totalElapsedMs: Number(data.total_elapsed_ms),
      isActive: data.is_active,
      date,
    };
  },

  async putToday(body: Partial<WorkSessionFromApi>): Promise<WorkSessionFromApi> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const date = todayDateStr();
    const { error } = await supabase.from('work_sessions').upsert({
      user_id: user.id,
      date,
      start_time_ts: body.startTime ?? null,
      day_start_time_str: body.dayStartTime ?? null,
      total_elapsed_ms: body.totalElapsedMs ?? 0,
      is_active: body.isActive ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date' });

    if (error) throw new Error(error.message);
    return await sessions.getToday();
  },
};

// ----- Daily Logs -----
export const dailyLogs = {
  async list(): Promise<DailyLogFromApi[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    return (data || []).map((r) => ({
      date: r.date,
      hoursWorked: r.hours_worked,
      hourlyRate: r.hourly_rate,
      vibe: r.vibe as 'Sushi' | 'Salad' | 'Bread',
      shifts: r.shifts,
      startTimeStr: r.start_time_str ?? undefined,
      endTimeStr: r.end_time_str ?? undefined,
    }));
  },

  async create(body: DailyLogFromApi): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { error } = await supabase.from('daily_logs').upsert({
      user_id: user.id,
      date: body.date,
      hours_worked: body.hoursWorked,
      hourly_rate: body.hourlyRate,
      vibe: body.vibe,
      shifts: body.shifts || 1,
      start_time_str: body.startTimeStr ?? null,
      end_time_str: body.endTimeStr ?? null,
    }, { onConflict: 'user_id,date' });

    if (error) throw new Error(error.message);
  },
};

// ----- Plaza -----
export interface MarketBenchmark {
  company: string;
  role: string;
  avgRate: number;
  userCount: number;
}

export const plaza = {
  async getCrew(): Promise<PeerLogFromApi[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    // Get recent daily logs from other users with their profiles
    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        user_id,
        date,
        hours_worked,
        hourly_rate,
        vibe,
        profiles!inner(rice_name, company, job_title)
      `)
      .neq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    // Dedupe by user (keep most recent)
    const seen = new Set<string>();
    const crew: PeerLogFromApi[] = [];
    for (const r of data || []) {
      if (seen.has(r.user_id)) continue;
      seen.add(r.user_id);
      const profile = r.profiles as unknown as { rice_name: string; company: string; job_title: string };
      crew.push({
        id: r.user_id,
        name: profile.rice_name,
        company: profile.company,
        jobTitle: profile.job_title,
        hoursWorked: r.hours_worked,
        hourlyRate: r.hourly_rate,
        vibe: r.vibe as 'Sushi' | 'Salad' | 'Bread',
      });
    }
    return crew;
  },

  async getMarketBenchmarks(): Promise<MarketBenchmark[]> {
    // 获取所有用户的 daily_logs 和 profile 信息
    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        hourly_rate,
        profiles!inner(company, job_title)
      `)
      .order('date', { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    // 按 company + job_title 分组计算平均值
    const groups: Record<string, { total: number; count: number; company: string; role: string }> = {};
    
    for (const r of data) {
      const profile = r.profiles as unknown as { company: string; job_title: string };
      const key = `${profile.company}|${profile.job_title}`;
      
      if (!groups[key]) {
        groups[key] = { total: 0, count: 0, company: profile.company, role: profile.job_title };
      }
      groups[key].total += r.hourly_rate;
      groups[key].count += 1;
    }

    // 转换为数组并排序
    const benchmarks: MarketBenchmark[] = Object.values(groups)
      .map(g => ({
        company: g.company,
        role: g.role,
        avgRate: Math.round(g.total / g.count),
        userCount: g.count,
      }))
      .sort((a, b) => b.avgRate - a.avgRate);

    return benchmarks;
  },
};
