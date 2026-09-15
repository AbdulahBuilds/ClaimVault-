import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { FilterType, SortType } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCard } from '../components/cards/ProductCard';
import { CATEGORIES } from '../constants/categories';
import { triggerHaptic } from '../utils/haptics';

interface ProductsScreenProps {
  onSelectProduct: (productId: string) => void;
  onGoToAdd: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  onSelectProduct,
  onGoToAdd,
}) => {
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useProducts();

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active Warranty' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'expired', label: 'Expired' },
    { id: 'return_period', label: 'Return Period' },
  ];

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Pinned Top Header */}
      <div className="w-full px-4 pt-4 pb-3 bg-white border-b border-brand-border shrink-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-brand-navy tracking-tight">
              Your Products
            </h1>
            <p className="text-xs font-medium text-brand-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} in vault
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onGoToAdd();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, stores..."
              className="w-full bg-slate-100/90 text-brand-navy placeholder:text-brand-muted text-xs font-medium rounded-xl py-2.5 pl-9 pr-8 border border-transparent focus:border-brand-teal focus:bg-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              triggerHaptic('selection');
              setShowFiltersModal(!showFiltersModal);
            }}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
              selectedCategory !== 'All' || sortBy !== 'expiry_asc'
                ? 'bg-brand-teal text-white border-brand-teal shadow-sm'
                : 'bg-slate-100 text-brand-navy border-slate-200/80 hover:bg-slate-200'
            }`}
            title="Filter & Sort"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar w-full">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveFilter(tab.id);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-slate-100/80 text-brand-muted hover:text-brand-navy hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Modal / Sheet */}
      {showFiltersModal && (
        <div className="w-full bg-slate-50 border-b border-brand-border p-4 space-y-3 shrink-0 overflow-hidden animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Category Filter
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSortBy('expiry_asc');
              }}
              className="text-[11px] font-bold text-brand-teal hover:underline"
            >
              Reset Filters
            </button>
          </div>

          {/* Categories Grid */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedCategory === 'All'
                  ? 'bg-brand-teal text-white'
                  : 'bg-white border border-brand-border text-brand-muted hover:text-brand-navy'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-brand-teal text-white'
                    : 'bg-white border border-brand-border text-brand-muted hover:text-brand-navy'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider block mb-2">
              Sort By
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'expiry_asc', label: 'Warranty Expiry (Soonest)' },
                { id: 'purchase_desc', label: 'Recently Purchased' },
                { id: 'price_desc', label: 'Highest Price' },
                { id: 'name_asc', label: 'Product Name (A-Z)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as SortType)}
                  className={`text-[11px] p-2 rounded-lg font-semibold text-left transition truncate ${
                    sortBy === s.id
                      ? 'bg-brand-navy text-white'
                      : 'bg-white border border-brand-border text-brand-muted hover:text-brand-navy'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products List Content */}
      <div className="p-4 space-y-3 pb-8 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              searchQuery || activeFilter !== 'all' || selectedCategory !== 'All'
                ? "We couldn't find any products matching your current filters. Try resetting search or filter options."
                : "Add your first purchase and we'll help you keep track of its warranty and return period."
            }
            actionLabel="Add Product"
            onAction={onGoToAdd}
            secondaryLabel={
              searchQuery || activeFilter !== 'all' || selectedCategory !== 'All'
                ? 'Clear Filters'
                : undefined
            }
            onSecondaryAction={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedCategory('All');
            }}
            className="my-6"
          />
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onSelectProduct}
            />
          ))
        )}
      </div>
    </div>
  );
};
