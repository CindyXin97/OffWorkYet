
import React from 'react';
import { UserProfile, DailyLog } from '../types';
import { CuteCharacter } from './CuteCharacter';
import { TARGET_WORK_HOURS } from '../constants';

interface DailyReportProps {
  profile: UserProfile;
  log: DailyLog;
  onShare: () => void;
  onRestart: () => void;
}

export const DailyReport: React.FC<DailyReportProps> = ({ profile, log, onShare, onRestart }) => {
  const dailyIncome = profile.monthlySalary / (profile.workingDaysPerMonth || 22);
  const standardRate = dailyIncome / TARGET_WORK_HOURS;
  const diffPercent = ((log.hourlyRate / standardRate) - 1) * 100;
  const isBetter = log.hourlyRate > standardRate;

  return (
    <div className="flex flex-col h-full bg-[#fffcf0] p-6 pb-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={onRestart}
          className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-xl font-bold"
        >
          ←
        </button>
        <div className="ml-4">
          <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-0">
            {profile.jobTitle} @ {profile.company}
          </p>
          <p className="font-black text-gray-800 text-lg">Daily Summary</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-4 relative">
          <CuteCharacter mood={isBetter ? 'happy' : 'chill'} accessory={isBetter ? 'sushi' : 'none'} size={150} />
          {isBetter && (
            <div className="absolute top-2 -right-8 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-black rotate-12 shadow-[2px_2px_0px_0px_#000] z-20">
              PEAK VIBE
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-black text-[#5d4037] mb-6 text-center px-4 leading-tight">
          Today's Vibe Check:<br/><span className="text-[#2d5a27]">{profile.riceName}!</span>
        </h2>

        <div className="w-full space-y-2.5">
           <div className="bg-white p-5 cute-card rounded-[24px] text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Final Actual Rate</p>
              <h3 className="text-3xl font-black text-[#2d5a27]">${log.hourlyRate.toFixed(0)} <span className="text-base">/ hr</span></h3>
           </div>

           <div className="bg-white p-3 cute-card rounded-xl text-center opacity-70 flex justify-between items-center px-5 border-dashed">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Standard (8h) Rate</p>
              <h3 className="text-base font-bold text-gray-600">${standardRate.toFixed(0)} / hr</h3>
           </div>
        </div>

        <div className="mt-4 text-center px-4">
          <p className={`text-sm font-black ${isBetter ? 'text-green-600' : 'text-orange-600'}`}>
            {isBetter 
              ? `🔥 ${Math.abs(diffPercent).toFixed(1)}% ABOVE TARGET!` 
              : `📉 ${Math.abs(diffPercent).toFixed(1)}% below target rate.`}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
            {isBetter ? "You're living that Sushi lifestyle!" : "Rest up, don't let the Bread vibe win."}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button 
          onClick={onShare}
          className="w-full bg-[#fce38a] text-[#5d4037] py-4 rounded-xl font-black text-lg cute-button active:scale-95 transition-transform"
        >
          Share My Vibe! 🚀
        </button>
      </div>
    </div>
  );
};
