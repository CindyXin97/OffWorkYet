
import React, { useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import { MOCK_PEERS, MOCK_NETWORK } from '../constants';
import { CuteCharacter } from './CuteCharacter';

interface PlazaProps {
  profile: UserProfile;
  history: DailyLog[];
  onBack: () => void;
}

type PlazaTab = 'MY_VIBES' | 'TOAST_CREW' | 'MY_NETWORK';

const TimelineGraph: React.FC<{ data: DailyLog[] }> = ({ data }) => {
  if (data.length === 0) return null;
  
  const displayData = [...data].reverse().slice(-7); // Last 7 days
  const maxRate = Math.max(...displayData.map(d => d.hourlyRate), 100);
  const count = displayData.length;
  
  // Calculate points for the trend line
  const points = displayData.map((log, i) => {
    const x = ((i + 0.5) / count) * 100;
    const y = 100 - (log.hourlyRate / maxRate) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full bg-white p-4 rounded-3xl cute-card mb-6 overflow-visible">
      <p className="text-xs font-black text-gray-400 mb-4 uppercase">Hourly Rate Trend</p>
      <div className="h-32 relative px-2">
        {/* SVG Line Overlay */}
        <svg className="absolute inset-x-2 inset-y-0 w-[calc(100%-16px)] h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />
          {displayData.map((log, i) => {
            const x = ((i + 0.5) / count) * 100;
            const y = 100 - (log.hourlyRate / maxRate) * 100;
            return (
              <circle 
                key={i} 
                cx={x} 
                cy={y} 
                r="1.5" 
                fill="black" 
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Bars Container */}
        <div className="h-full flex items-end justify-between gap-2 relative z-0">
          {displayData.map((log, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white p-2 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap border border-white/20">
                 <div className="font-black text-[#7be0ae] mb-1">Rate: ${log.hourlyRate.toFixed(0)}/hr</div>
                 {log.startTimeStr && log.endTimeStr ? (
                   <div className="flex flex-col gap-0.5">
                     <span>In: {log.startTimeStr}</span>
                     <span>Out: {log.endTimeStr}</span>
                   </div>
                 ) : <span>No time data</span>}
              </div>

              <div 
                className={`w-full rounded-t-lg border-x-2 border-t-2 border-black transition-all duration-500 shadow-sm ${
                  log.vibe === 'Sushi' ? 'bg-green-400' : log.vibe === 'Salad' ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ height: `${(log.hourlyRate / maxRate) * 100}%` }}
              >
              </div>
              <div className="text-[10px] font-bold text-gray-400 mt-2 rotate-45 origin-left">
                {log.date.split('/')[1]}/{log.date.split('/')[0]}
              </div>
            </div>
          ))}
          {displayData.length < 7 && Array.from({ length: 7 - displayData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 h-2 bg-gray-50 border-b-2 border-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Plaza: React.FC<PlazaProps> = ({ profile, history, onBack }) => {
  const [activeTab, setActiveTab] = useState<PlazaTab>('MY_VIBES');
  const [hugs, setHugs] = useState<Record<string, boolean>>({});

  const toggleHug = (id: string) => {
    setHugs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const dailyPay = profile.monthlySalary / (profile.workingDaysPerMonth || 22);

  // Calculate Averages
  const calculateAverageTime = (type: 'startTimeStr' | 'endTimeStr') => {
    const logsWithTime = history.filter(l => l[type] && l[type] !== 'N/A');
    if (logsWithTime.length === 0) return "--:--";
    
    const totalMinutes = logsWithTime.reduce((acc, log) => {
      const [h, m] = (log[type] || "00:00").split(':').map(Number);
      return acc + (h * 60 + m);
    }, 0);
    
    const avgMinutes = Math.round(totalMinutes / logsWithTime.length);
    const h = Math.floor(avgMinutes / 60).toString().padStart(2, '0');
    const m = (avgMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const avgStart = calculateAverageTime('startTimeStr');
  const avgEnd = calculateAverageTime('endTimeStr');

  return (
    <div className="flex flex-col h-full bg-[#f0eaff]">
      <div className="p-5 pb-1">
        <div className="flex items-center gap-3 mb-4">
           <button onClick={onBack} className="text-xl font-black">←</button>
           <h1 className="text-xl font-black">The Plaza</h1>
        </div>

        <div className="flex bg-white/50 p-1 rounded-xl border-2 border-black">
          {(['MY_VIBES', 'TOAST_CREW', 'MY_NETWORK'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeTab === tab ? 'bg-black text-white' : 'text-gray-600'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-1">
        {activeTab === 'MY_VIBES' && (
          <div className="space-y-3">
             <div className="bg-[#d1f9e5] p-5 cute-card rounded-2xl">
                <div className="flex justify-between mb-3">
                   <div className="bg-white px-2.5 py-0.5 rounded-full border border-black text-[10px] font-bold">
                      Today: {history[0]?.hoursWorked.toFixed(1) || 0}h
                   </div>
                   <span className="font-black text-green-700 text-sm">${dailyPay.toFixed(0)} / Day</span>
                </div>
                <div className="flex flex-col items-center">
                   <CuteCharacter mood="happy" size={90} accessory={history[0]?.vibe === 'Sushi' ? 'sushi' : 'none'} />
                   <p className="mt-3 font-black text-base">{profile.riceName}'s Growth</p>
                   
                   {/* Average Times Display */}
                   <div className="mt-2.5 flex gap-3">
                      <div className="bg-white/60 border border-black/10 px-2.5 py-1.5 rounded-xl text-center shadow-sm">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Avg Start</p>
                         <p className="font-black text-xs text-green-600">{avgStart}</p>
                      </div>
                      <div className="bg-white/60 border border-black/10 px-2.5 py-1.5 rounded-xl text-center shadow-sm">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Avg End</p>
                         <p className="font-black text-xs text-red-600">{avgEnd}</p>
                      </div>
                   </div>
                </div>
             </div>

             <TimelineGraph data={history} />
             
             <h2 className="text-[10px] font-black text-gray-400 uppercase ml-2">History Logs</h2>
             {history.map((log, i) => (
                <div key={i} className="bg-white p-3.5 cute-card rounded-xl flex justify-between items-center group">
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400">{log.date}</p>
                      <p className="font-black text-base">${log.hourlyRate.toFixed(0)} / hr</p>
                      {log.startTimeStr && (
                        <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                          Grind: {log.startTimeStr} → {log.endTimeStr}
                        </p>
                      )}
                   </div>
                   <div className="text-2xl">
                      {log.vibe === 'Sushi' ? '🍣' : log.vibe === 'Salad' ? '🥗' : '🥖'}
                   </div>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'TOAST_CREW' && (
          <div className="space-y-3 pb-8 px-2">
            <h2 className="text-center font-black text-purple-800 text-lg py-2 uppercase tracking-tighter">比惨大会 (Toast Crew)</h2>
            {MOCK_PEERS.map(peer => (
              <div key={peer.id} className="bg-white p-3.5 cute-card rounded-xl ml-4 mr-2">
                <div className="flex justify-between items-start mb-1.5">
                   <div className="flex gap-8 items-center">
                      <div className="w-14 h-14 relative flex-shrink-0">
                         <CuteCharacter 
                           mood={peer.vibe === 'Sushi' ? 'happy' : peer.vibe === 'Salad' ? 'chill' : 'sad'} 
                           size={56} 
                           accessory={peer.vibe === 'Sushi' ? 'sushi' : peer.vibe === 'Bread' ? 'toast' : 'none'} 
                         />
                      </div>
                      <div className="pt-0.5">
                         <p className="font-black text-sm">{peer.name}</p>
                         <p className="text-[10px] font-bold text-gray-500">{peer.company} · {peer.jobTitle}</p>
                         <p className="text-[10px] font-bold text-gray-400 tracking-tight">Hours: {peer.hoursWorked}h</p>
                      </div>
                   </div>
                   <div className="text-right flex-shrink-0">
                      <p className="font-black text-xs text-green-700">${peer.hourlyRate.toFixed(0)} <span className="text-[9px]">/hr</span></p>
                   </div>
                </div>
                <div className="flex justify-end gap-2 mt-1.5">
                   <button 
                    onClick={() => toggleHug(peer.id)}
                    className={`px-3 py-1 rounded-full border-2 border-black text-[9px] font-black transition-all ${
                      hugs[peer.id] ? 'bg-pink-400 text-white shadow-none translate-x-0.5 translate-y-0.5' : 'bg-white shadow-[1.5px_1.5px_0px_0px_#000]'
                    }`}
                   >
                     {hugs[peer.id] ? 'Sent Hug! ❤️' : 'Send Hug 🤗'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'MY_NETWORK' && (
          <div className="space-y-4 pb-8">
             <div className="bg-[#fff9e6] p-3 cute-card rounded-xl text-center mb-4">
                <p className="text-xs font-black uppercase tracking-widest">Market Benchmarks</p>
             </div>
             {MOCK_NETWORK.map((item, i) => (
               <div key={i} className="bg-white p-4 cute-card rounded-2xl flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-blue-50 border-2 border-black rounded-xl flex items-center justify-center font-black text-blue-600 shadow-[1.5px_1.5px_0px_0px_#000]">
                       {item.company[0]}
                    </div>
                    <div>
                       <h3 className="font-black text-base">{item.company}</h3>
                       <p className="text-[10px] text-gray-500 font-bold">{item.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-black text-base">${item.baseRate.toFixed(0)} / hr</p>
                     <p className="text-[9px] font-bold text-green-500">{item.vibe} Vibe</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="p-4 flex justify-center bg-white border-t-2 border-black">
         <div className="flex flex-col items-center">
            <div className="w-8 h-8 mb-1">
               <CuteCharacter mood="happy" size={32} />
            </div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">#OffWorkYet</p>
         </div>
      </div>
    </div>
  );
};
