import React from 'react';
import { Package, Receipt, Clock, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { formatPKR } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/haptics';
import { Badge, CategoryBadge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onClick: (productId: string) => void;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  variant = 'detailed',
  className = '',
}) => {
  const handleClick = () => {
    triggerHaptic('light');
    onClick(product.id);
  };

  if (variant === 'compact') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`w-full max-w-full p-3 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover active:scale-[0.99] transition cursor-pointer flex items-center justify-between gap-3 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
            ) : (
              <Package className="w-5 h-5 text-brand-navy" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-brand-navy truncate group-hover:text-brand-teal transition">
              {product.name}
            </h4>
            <p className="text-[11px] font-bold text-brand-teal mt-0.5">
              {formatPKR(product.price)}
            </p>
            <p className="text-[10px] text-brand-muted mt-0.5 truncate">
              Purchased: {formatDate(product.purchaseDate)} • {product.warranty.durationLabel}
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-navy transition shrink-0" />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`w-full max-w-full p-4 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover active:scale-[0.99] transition cursor-pointer flex flex-col gap-3 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${className}`}
    >
      {/* Top row: Thumbnail, Name, Price, Status */}
      <div className="flex items-start justify-between gap-2.5 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <Package className="w-6 h-6 text-brand-navy" />
            )}

            {product.receipt && (
              <div
                className="absolute bottom-0 right-0 bg-brand-navy text-white p-0.5 rounded-tl-md"
                title="Receipt Saved"
              >
                <Receipt className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-brand-navy truncate group-hover:text-brand-teal transition">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <CategoryBadge label={product.category} />
              <span className="text-xs font-bold text-brand-teal">
                {formatPKR(product.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Badge status={product.warranty.status} size="sm" />
        </div>
      </div>

      {/* Expiry Dates & Return Tag */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-brand-muted w-full">
        <div className="truncate pr-2">
          <span className="text-brand-muted">Purchased: </span>
          <span className="font-semibold text-brand-navy">
            {formatDate(product.purchaseDate)}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-brand-muted">Expires: </span>
          <span className="font-semibold text-brand-navy">
            {formatDate(product.warranty.expiryDate)}
          </span>
        </div>
      </div>

      {/* Return Deadline if active */}
      {product.returnInfo.hasReturnPeriod && product.returnInfo.status !== 'expired' && (
        <div className="bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 text-[10px] font-bold text-amber-900 flex items-center justify-between w-full">
          <span className="flex items-center gap-1 truncate pr-1">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" /> Return Window Active
          </span>
          <span className="shrink-0">Until {formatDate(product.returnInfo.returnDeadline)}</span>
        </div>
      )}
    </div>
  );
};
