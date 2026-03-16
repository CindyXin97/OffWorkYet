
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CuteCharacter } from './CuteCharacter';

interface RegistrationProps {
  initialData?: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

type Step = 'LOGIN' | 'REGISTER_EMAIL' | 'VERIFY' | 'GRIND' | 'SALARY';

export const Registration: React.FC<RegistrationProps> = ({ initialData, onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>(initialData?.isRegistered ? 'GRIND' : 'LOGIN');
  
  const [form, setForm] = useState(initialData || {
    riceName: '',
    password: '',
    email: '',
    city: '',
    jobTitle: 'Senior SWE',
    company: 'Meta',
    monthlySalary: 2200,
    workingDaysPerMonth: 22,
    isRegistered: false,
    name: 'User'
  });

  const [verifyCode, setVerifyCode] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Since we don't have a backend geocoder, we format a readable location string
        // In a real app, this would use an API to get the actual city name.
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
    else if (step === 'VERIFY') setStep('REGISTER_EMAIL');
    else if (step === 'GRIND') {
        if (initialData?.isRegistered && onCancel) onCancel(); 
        else setStep('VERIFY');
    }
    else if (step === 'SALARY') setStep('GRIND');
  };

  const isFormValid = () => {
    if (step === 'LOGIN') return form.riceName && form.password;
    if (step === 'REGISTER_EMAIL') return form.email && form.email.includes('@');
    if (step === 'VERIFY') return verifyCode.length === 4;
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
          {['LOGIN', 'REG', 'CODE', 'JOB', 'PAY'].map((s, i) => (
            <div 
              key={s} 
              className={`h-2 rounded-full border border-black transition-all duration-300 ${
                ['LOGIN', 'REGISTER_EMAIL', 'VERIFY', 'GRIND', 'SALARY'].indexOf(step) >= i ? 'bg-[#7be0ae] w-8' : 'bg-gray-200 w-4'
              }`} 
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-[#2d5a27] mb-1 leading-tight">
          {step === 'LOGIN' && "Welcome Back!"}
          {step === 'REGISTER_EMAIL' && "New Account"}
          {step === 'VERIFY' && "Verify Email"}
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
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Rice Ball Nickname</label>
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded-lg border-2 border-black focus-within:bg-white transition-colors">
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
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Secret Password</label>
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
              onClick={() => onComplete({ ...form, isRegistered: true })}
              disabled={!isFormValid()}
              className={`w-full py-2.5 rounded-lg font-black text-lg cute-button transition-all ${
                isFormValid() ? 'bg-[#7be0ae] text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              Log In
            </button>
            <button 
              onClick={() => setStep('REGISTER_EMAIL')}
              className="w-full text-xs font-black text-gray-400 uppercase tracking-widest"
            >
              Register with Email
            </button>
          </div>
        )}

        {step === 'REGISTER_EMAIL' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2 tracking-widest">Email Address</label>
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
            <button 
              onClick={() => setStep('VERIFY')}
              disabled={!isFormValid()}
              className={`w-full py-2.5 rounded-lg font-black text-lg cute-button transition-all ${
                isFormValid() ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              Send Code
            </button>
          </div>
        )}

        {step === 'VERIFY' && (
          <div className="space-y-2.5 text-center">
            <p className="text-[10px] font-bold text-gray-500">Enter code sent to {form.email}</p>
            <div className="flex justify-center gap-2">
              <input 
                type="text" 
                maxLength={4}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                className="w-32 bg-gray-50 p-2.5 rounded-lg border-2 border-black text-center text-xl font-black tracking-[0.5em] focus:outline-none"
                placeholder="0000"
              />
            </div>
            <button 
              onClick={() => setStep('GRIND')}
              disabled={!isFormValid()}
              className={`w-full py-2.5 rounded-lg font-black text-lg bg-[#7be0ae] text-white cute-button`}
            >
              Verify Code
            </button>
          </div>
        )}

        {step === 'GRIND' && (
          <div className="space-y-2.5">
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
              onClick={() => onComplete({ ...form, isRegistered: true })}
              className="w-full py-2.5 rounded-lg font-black text-lg bg-[#7be0ae] text-white cute-button"
            >
              {initialData?.isRegistered ? "Update & Save" : "Save & Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
