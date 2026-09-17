import { ProductCategory } from '../types';

export interface CategoryOption {
  id: ProductCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryOption[] = [
  {
    id: 'Electronics',
    label: 'Electronics',
    iconName: 'Smartphone',
    color: '#0F8B8D',
    bgColor: '#E6F6F6',
  },
  {
    id: 'Computing',
    label: 'Computing & Laptops',
    iconName: 'Laptop',
    color: '#123B5D',
    bgColor: '#E2E8F0',
  },
  {
    id: 'Audio',
    label: 'Audio & Wearables',
    iconName: 'Headphones',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  {
    id: 'Appliances',
    label: 'Home Appliances',
    iconName: 'Refrigerator',
    color: '#0284C7',
    bgColor: '#E0F2FE',
  },
  {
    id: 'Kitchen',
    label: 'Kitchen Appliances',
    iconName: 'Coffee',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 'Wearables',
    label: 'Smartwatches',
    iconName: 'Watch',
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: 'Home',
    label: 'Home & Living',
    iconName: 'Home',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: 'Vehicles',
    label: 'Vehicles & Automotive',
    iconName: 'Car',
    color: '#E11D48',
    bgColor: '#FFE4E6',
  },
  {
    id: 'Other',
    label: 'Other Items',
    iconName: 'Package',
    color: '#64748B',
    bgColor: '#F1F5F9',
  },
];
