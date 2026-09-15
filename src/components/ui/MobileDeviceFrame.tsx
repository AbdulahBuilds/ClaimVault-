import React, { ReactNode } from 'react';

interface MobileDeviceFrameProps {
  children: ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] min-h-screen bg-slate-950 flex justify-center items-center overflow-hidden font-sans">
      <div className="w-full h-[100dvh] max-w-md bg-brand-bg flex flex-col relative overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
};
