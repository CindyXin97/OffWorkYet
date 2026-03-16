
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-50 md:py-8">
      <div className="w-full max-w-[380px] bg-white h-[100dvh] md:h-[760px] md:max-h-[760px] overflow-hidden relative shadow-2xl flex flex-col md:rounded-[32px] md:border-4 border-gray-900">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};
