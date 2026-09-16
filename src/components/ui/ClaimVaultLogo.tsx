import React from 'react';
import appLogo from '../../assets/logo.png';

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

  const roundedMap = {
    xs: 'rounded-lg',
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  };

  const logoSrc = appLogo || '/claimvault-logo.png';

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="ClaimVault Logo"
        onError={(e) => {
          if (e.currentTarget.src !== window.location.origin + '/claimvault-logo.png') {
            e.currentTarget.src = '/claimvault-logo.png';
          }
        }}
        className={`${sizeMap[size]} ${roundedMap[size]} object-contain select-none shrink-0`}
      />
      {withText && (
        <span className={`font-extrabold tracking-tight ${textColor} ${textSize}`}>
          ClaimVault
        </span>
      )}
    </div>
  );
};
