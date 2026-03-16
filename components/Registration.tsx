import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CuteCharacter } from './CuteCharacter';

interface RegistrationProps {
  initialData?: UserProfile;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (profile: UserProfile & { password?: string; email?: string }) => Promise<void>;
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
  onCancel?: () => void;
}

type Step = 'LOGIN' | 'REGISTER_EMAIL' | 'REGISTER_PROFILE' | 'GRIND' | 'SALARY';

export const Registration: React.FC<RegistrationProps> = ({ initialData, onLogin, onRegister, onUpdateProfile, onCancel }) => {
  const [step, setStep] = useState<Step>(initialData?.isRegistered ? 'GRIND' : 'LOGIN');
  
  const [form, setForm] = useState({
    riceName: initialData?.riceName || '',
    password: '',
    email: '',
    city: initialData?.city || '',
    jobTitle: initialData?.jobTitle || 'Senior SWE',
    company: initialData?.company || 'Meta',
    monthlySalary: initialData?.monthlySalary || 2200,
    workingDaysPerMonth: initialData?.workingDaysPerMonth || 22,
    isRegistered: initialData?.isRegistered || false,
    name: initialData?.name || 'User',
  });

  const [isLocating, setIsLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = `Global District #${Math.floor(pos.coords.latitude)}`;
        setForm(prev => ({ ...prev, city: city }));
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePrev = () => {
    if (step === 'LOGIN') return;
    else if (step === 'REGISTER_EMAIL') setStep('LOGIN');
    else if (step === 'REGISTER_PROFILE') setStep('REGISTER_EMAIL');
    else if (step === 'GRIND') {
      if (initialData?.isRegistered && onCancel) onCancel();
      else setStep('REGISTER_PROFILE');
    }
    else if (step === 'SALARY') setStep('GRIND');
  };

  const isFormValid = () => {
    if (step === 'LOGIN') return form.email && form.email.includes('@') && form.password;
    if (step === 'REGISTER_EMAIL') return form.email && form.email.includes('@') && form.password && form.password.length >= 6;
    if (step === 'REGISTER_PROFILE') return form.riceName.trim().length > 0;
    return true;
  };

  return (
    <div className="flex flex-col h-full bg-[#f2fff8] p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        {(step !== 'LOGIN' || (initialData?.isRegistered && onCancel)) ? (
          <button 
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-xl font-bold"
          >
            ←
          </button>
        ) : <div className="w-10" />}
        
        <div className="flex gap-1.5">
          {['LOGIN', 'EMAIL', 'PROFILE', 'JOB', 'PAY'].map((s, i) => (
            <div 
              key={s} 
              className={`h-2 rounded-full border border-black transition-all duration-300 ${
                ['LOGIN', 'REGISTER_EMAIL', 'REGISTER_PROFILE', 'GRIND', 'SALARY'].indexOf(step) >= i ? 'bg-[#7be0ae] w-8' : 'bg-gray-200 w-4'
              }`} 
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-[#2d5a27] mb-1 leading-tight">
          {step === 'LOGIN' && "Welcome Back!"}
          {step === 'REGISTER_EMAIL' && "Create Account"}
          {step === 'REGISTER_PROFILE' && "Your Profile"}
          {step === 'GRIND' && (initialData?.isRegistered ? "Edit Work Info" : "The Grind")}
          {step === 'SALARY' && "Money & Vibe"}
        </h1>
        <div className="flex justify-center my-3">
          <CuteCharacter mood="happy" size={step === 'LOGIN' ? 120 : 90} />
        </div>
      </div>

      <div className="bg-white p-3.5 cute-card rounded-xl space-y-2.5">
        {step === 'LOGIN' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Email</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black focus-within:bg-white transition-colors">
                <span className="text-base">📧</span>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Password</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black focus-within:bg-white transition-colors">
                <span className="text-base">🔑</span>
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              onClick={async () => {
                if (!isFormValid()) return;
                setSubmitting(true);
                try { await onLogin(form.email, form.password); } finally { setSubmitting(false); }
              }}
              disabled={!isFormValid() || submitting}
              className={`w-full py-2.5 rounded-lg font-black text-lg cute-button transition-all ${
                isFormValid() && !submitting ? 'bg-[#7be0ae] text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {submitting ? '...' : 'Log In'}
            </button>
            <button 
              onClick={() => setStep('REGISTER_EMAIL')}
              className="w-full text-xs font-black text-gray-400 uppercase tracking-widest"
            >
              Create New Account
            </button>
          </div>
        )}

        {step === 'REGISTER_EMAIL' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Email</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">📧</span>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Password (min 6 chars)</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">🔑</span>
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep('REGISTER_PROFILE')}
              disabled={!isFormValid()}
              className={`w-full py-2.5 rounded-lg font-black text-lg cute-button transition-all ${
                isFormValid() ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {step === 'REGISTER_PROFILE' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Rice Ball Nickname</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">🍙</span>
                <input 
                  type="text" 
                  value={form.riceName} 
                  onChange={e => setForm({...form, riceName: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="e.g. Sushi Master"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep('GRIND')}
              disabled={!isFormValid()}
              className={`w-full py-2.5 rounded-lg font-black text-lg cute-button transition-all ${
                isFormValid() ? 'bg-[#7be0ae] text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {step === 'GRIND' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Your Name</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">👤</span>
                <input 
                  type="text" 
                  value={form.name === 'User' ? '' : form.name} 
                  onChange={e => setForm({...form, name: e.target.value || 'User'})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="Your display name"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 ml-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                <button 
                  onClick={detectLocation}
                  className="text-[10px] font-black text-[#7be0ae] uppercase tracking-wider underline"
                >
                  {isLocating ? "Locating..." : "Auto Fetch"}
                </button>
              </div>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">📍</span>
                <input 
                  type="text" 
                  value={form.city} 
                  onChange={e => setForm({...form, city: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder={isLocating ? "Fetching..." : "City"}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Company</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">🏢</span>
                <input 
                  type="text" 
                  value={form.company} 
                  onChange={e => setForm({...form, company: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="Company"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Job Title</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">💼</span>
                <input 
                  type="text" 
                  value={form.jobTitle} 
                  onChange={e => setForm({...form, jobTitle: e.target.value})}
                  className="bg-transparent w-full font-bold focus:outline-none text-sm"
                  placeholder="Your Role"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep('SALARY')}
              className="w-full py-2.5 rounded-lg font-black text-lg bg-[#7be0ae] text-white cute-button"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 'SALARY' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Monthly Salary</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base text-green-600">💰</span>
                <input 
                  type="number" 
                  value={form.monthlySalary} 
                  onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})}
                  className="bg-transparent w-full text-lg font-black focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Working Days/Month</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black">
                <span className="text-base">🗓️</span>
                <input 
                  type="number" 
                  value={form.workingDaysPerMonth} 
                  onChange={e => setForm({...form, workingDaysPerMonth: Number(e.target.value)})}
                  className="bg-transparent w-full text-base font-bold focus:outline-none"
                />
              </div>
            </div>
            <button 
              onClick={async () => {
                setSubmitting(true);
                try {
                  if (initialData?.isRegistered) {
                    await onUpdateProfile({ ...form, isRegistered: true });
                  } else {
                    await onRegister({ ...form, isRegistered: true });
                  }
                } finally { setSubmitting(false); }
              }}
              disabled={submitting}
              className="w-full py-2.5 rounded-lg font-black text-lg bg-[#7be0ae] text-white cute-button disabled:opacity-70"
            >
              {submitting ? '...' : (initialData?.isRegistered ? "Update & Save" : "Save & Finish")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
