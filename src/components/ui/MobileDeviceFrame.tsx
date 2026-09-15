import React, { ReactNode } from 'react';

interface MobileDeviceFrameProps {
  children: ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex justify-center items-stretch overflow-hidden font-sans">
      <div className="w-full h-full max-w-md bg-brand-bg flex flex-col relative overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
};
