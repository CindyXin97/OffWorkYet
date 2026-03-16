
import React from 'react';

interface CuteCharacterProps {
  mood: 'happy' | 'chill' | 'sad' | 'work';
  size?: number;
  accessory?: 'sushi' | 'toast' | 'coffee' | 'none';
}

export const CuteCharacter: React.FC<CuteCharacterProps> = ({ mood, size = 120, accessory = 'none' }) => {
  return (
    <div className="relative inline-block animate-float" style={{ width: size, height: size }}>
      {/* The White Blob Body */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <path
          d="M20,80 Q20,30 50,20 Q80,30 80,80 Q50,90 20,80 Z"
          fill="white"
          stroke="black"
          strokeWidth="3"
        />
        {/* Eyes */}
        {mood === 'happy' && (
          <>
            <path d="M35,45 Q40,40 45,45" fill="none" stroke="black" strokeWidth="2" />
            <path d="M55,45 Q60,40 65,45" fill="none" stroke="black" strokeWidth="2" />
          </>
        )}
        {mood === 'chill' && (
          <>
             <circle cx="35" cy="45" r="5" fill="black" />
             <circle cx="65" cy="45" r="5" fill="black" />
             <rect x="30" y="42" width="40" height="6" fill="black" rx="2" />
          </>
        )}
        {mood === 'sad' && (
          <>
            <circle cx="35" cy="45" r="3" fill="black" />
            <circle cx="65" cy="45" r="3" fill="black" />
            <path d="M40,65 Q50,55 60,65" fill="none" stroke="black" strokeWidth="2" />
          </>
        )}
        {mood === 'work' && (
          <>
            <path d="M30,45 L40,45 M60,45 L70,45" stroke="black" strokeWidth="3" strokeLinecap="round" />
            <path d="M45,60 Q50,65 55,60" fill="none" stroke="black" strokeWidth="2" />
          </>
        )}
        
        {/* Mouth */}
        {(mood === 'happy' || mood === 'work') && <path d="M45,60 Q50,65 55,60" fill="none" stroke="black" strokeWidth="2" />}
      </svg>
      
      {/* Redesigned Accessories as Floating Bubbles - Shifted further left to prevent text overlap */}
      {accessory === 'sushi' && (
        <div className="absolute -top-6 -left-12 bg-white border-2 border-black px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-[3px_3px_0px_0px_#000] -rotate-6 z-10 whitespace-nowrap">
           <span className="text-lg">🍣</span>
           <span className="text-[10px] font-black tracking-tighter">VIBE!</span>
           <div className="absolute -bottom-1 right-3 w-2 h-2 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
        </div>
      )}
      {accessory === 'toast' && (
        <div className="absolute -top-6 -left-12 bg-orange-50 border-2 border-black px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-[3px_3px_0px_0px_#000] rotate-6 z-10 whitespace-nowrap">
           <span className="text-lg">🍞</span>
           <span className="text-[10px] font-black tracking-tighter uppercase">Toasty</span>
           <div className="absolute -bottom-1 right-3 w-2 h-2 bg-orange-50 border-b-2 border-r-2 border-black rotate-45"></div>
        </div>
      )}
      {accessory === 'coffee' && (
        <div className="absolute bottom-2 -left-4 bg-white border-2 border-black w-8 h-8 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000] z-10">
           <span className="text-sm">☕</span>
        </div>
      )}
    </div>
  );
};
