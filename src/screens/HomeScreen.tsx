import React from 'react';
import { 
  Package, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { formatProductPrice, formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDaysDifference, getNow } from '../utils/dateUtils';
import { Badge, CategoryBadge, AIComingSoonBadge } from '../components/ui/Badge';
import { MobileHeader } from '../components/navigation/MobileHeader';
import { ProductCard } from '../components/cards/ProductCard';
import { triggerHaptic } from '../utils/haptics';
import { useToast } from '../context/ToastContext';

interface HomeScreenProps {
  onSelectProduct: (productId: string) => void;
  onGoToProducts: () => void;
  onGoToAdd: () => void;
  onGoToReminders: () => void;
  onOpenNotifications: () => void;
  onOpenAIScanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectProduct,
  onGoToProducts,
  onGoToAdd,
  onGoToReminders,
  onOpenNotifications,
  onOpenAIScanner,
}) => {
  const { products, stats, setActiveFilter } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();
  const now = getNow();

  // Find products expiring soon (warranty or return within 30 days)
  const expiringProducts = products
    .filter((p) => {
      const daysWar = getDaysDifference(p.warranty.expiryDate, now);
      const daysRet = p.returnInfo.hasReturnPeriod ? getDaysDifference(p.returnInfo.returnDeadline, now) : 999;
      return (daysWar >= 0 && daysWar <= 30) || (daysRet >= 0 && daysRet <= 14);
    })
    .slice(0, 4);

  // Recent Purchases (sorted by purchase date desc)
  const recentPurchases = [...products]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 4);

  const handleFilterClick = (filterKey: 'all' | 'active' | 'expiring' | 'return_period', target: 'products' | 'reminders') => {
    triggerHaptic('selection');
    setActiveFilter(filterKey);
    if (target === 'products') {
      onGoToProducts();
    } else {
      onGoToReminders();
    }
  };

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Pinned Dashboard Top Header */}
      <div className="shrink-0 z-10">
        <MobileHeader
          isDashboard
          userName={user?.name || 'Vault Owner'}
          onOpenNotifications={onOpenNotifications}
        />
      </div>

      {/* Main Scrollable Feed */}
      <div className="p-4 space-y-5 pb-8 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Products Count */}
          <div 
            onClick={() => handleFilterClick('all', 'products')}
            className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted group-hover:text-brand-navy transition">
                Products
              </span>
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center group-hover:bg-slate-200 transition">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-brand-navy tracking-tight">
                {stats.totalProducts}
              </span>
              <p className="text-[10px] text-brand-muted mt-0.5">Total Protected</p>
            </div>
          </div>

          {/* Active Warranties */}
          <div 
            onClick={() => handleFilterClick('active', 'products')}
            className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-teal group-hover:text-teal-700 transition">
                Active Warranties
              </span>
              <div className="w-7 h-7 rounded-xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center group-hover:bg-teal-100 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-brand-teal tracking-tight">
                {stats.activeWarranties}
              </span>
              <p className="text-[10px] text-brand-muted mt-0.5">Safe & Covered</p>
            </div>
          </div>

          {/* Expiring Soon */}
          <div 
            onClick={() => handleFilterClick('expiring', 'reminders')}
            className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-card hover:shadow-card-hover transition cursor-pointer flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 group-hover:text-amber-950 transition">
                Expiring Soon
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-200 transition">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-amber-700 tracking-tight">
                {stats.expiringSoon}
              </span>
              <p className="text-[10px] text-amber-700/80 mt-0.5">Needs Attention</p>
            </div>
          </div>

          {/* Return Deadline */}
          <div 
            onClick={() => handleFilterClick('return_period', 'reminders')}
            className="p-3.5 rounded-2xl bg-white border border-rose-200/80 shadow-card hover:shadow-card-hover transition cursor-pointer flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/40 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-red group-hover:text-rose-950 transition">
                Return Deadline
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-brand-red flex items-center justify-center group-hover:bg-rose-200 transition">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-brand-red tracking-tight">
                {stats.returnDeadlinesActive}
              </span>
              <p className="text-[10px] text-rose-700/80 mt-0.5">Window Closing</p>
            </div>
          </div>
        </div>

        {/* AI Scanner Banner / Quick Action */}
        <div 
          onClick={() => {
            triggerHaptic('medium');
            onOpenAIScanner();
          }}
          className="p-4 rounded-2xl bg-gradient-to-r from-brand-navy via-slate-800 to-teal-950 text-white shadow-card flex items-center justify-between cursor-pointer hover:shadow-card-hover transition active:scale-[0.99] border border-brand-teal/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-teal/20 rounded-full blur-xl pointer-events-none group-hover:bg-brand-teal/30 transition" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal-light group-hover:scale-105 transition shadow-glow-teal">
              <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">Scan Receipt with AI</h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-teal text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-yellow-300" />
                  Live AI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Scan receipts to extract details instantly</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-300 relative z-10 group-hover:translate-x-0.5 transition" />
        </div>

        {/* If Products Empty: Show Welcome & Quick Action Card */}
        {products.length === 0 ? (
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-card text-center space-y-4 my-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center mx-auto shadow-sm">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h3 className="text-base font-extrabold text-brand-navy">Your Vault is Empty</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Add your receipts or invoices to track warranties and return windows.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={onGoToAdd}
                className="w-full py-3 px-4 rounded-xl bg-brand-teal hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>+ Add Product</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Section: Expiring Soon */}
            {expiringProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-brand-navy tracking-tight">
                      Expiring Soon
                    </h2>
                    <p className="text-[11px] text-brand-muted">Action needed before warranty or return ends</p>
                  </div>
                  <button
                    onClick={onGoToReminders}
                    className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {expiringProducts.map((product) => {
                    const daysWarranty = getDaysDifference(product.warranty.expiryDate, now);
                    const daysReturn = product.returnInfo.hasReturnPeriod 
                      ? getDaysDifference(product.returnInfo.returnDeadline, now) 
                      : -1;

                    const isReturnUrgent = daysReturn >= 0 && daysReturn <= 7;
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => onSelectProduct(product.id)}
                        className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover transition cursor-pointer flex flex-col gap-3 group active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-brand-navy" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-brand-navy truncate group-hover:text-brand-teal transition">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <CategoryBadge label={product.category} />
                                <span className="text-[11px] text-brand-teal font-bold">
                                  {formatProductPrice(product.price, product.currency)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Badge status={product.warranty.status} size="sm" />
                        </div>

                        {/* Urgency Highlight Banner */}
                        <div className="flex items-center justify-between bg-amber-50/80 px-3 py-2 rounded-xl border border-amber-200/70 text-[11px]">
                          <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              {isReturnUrgent
                                ? `Return deadline in ${daysReturn} days`
                                : `Warranty expires in ${daysWarranty > 0 ? daysWarranty : 0} days`}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-brand-teal group-hover:underline flex items-center gap-0.5">
                            View Details
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Recent Purchases */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-brand-navy tracking-tight">
                    Recent Purchases
                  </h2>
                  <p className="text-[11px] text-brand-muted">Latest additions to your vault</p>
                </div>
                <button
                  onClick={() => handleFilterClick('all', 'products')}
                  className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {recentPurchases.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={onSelectProduct}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
