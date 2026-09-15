import React from 'react';

interface ClaimVaultLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  textColor?: string;
  textSize?: string;
}

export const ClaimVaultLogo: React.FC<ClaimVaultLogoProps> = ({
  className = '',
  size = 'md',
  withText = false,
  textColor = 'text-brand-navy',
  textSize = 'text-base',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/claimvault-logo.png"
        alt="ClaimVault Logo"
        className={`${sizeMap[size]} object-contain drop-shadow-sm rounded-2xl select-none`}
      />
      {withText && (
        <span className={`font-extrabold tracking-tight ${textColor} ${textSize}`}>
          ClaimVault
        </span>
      )}
    </div>
  );
};
