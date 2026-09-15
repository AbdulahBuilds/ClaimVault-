/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#123B5D',
          'navy-dark': '#0B263D',
          'navy-light': '#1D517D',
          teal: '#0F8B8D',
          'teal-light': '#14B8A6',
          'teal-subtle': '#E6F6F6',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
          'orange-subtle': '#FFFBEB',
          green: '#16A34A',
          'green-light': '#DCFCE7',
          'green-subtle': '#F0FDF4',
          red: '#DC2626',
          'red-light': '#FEE2E2',
          'red-subtle': '#FEF2F2',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#123B5D',
          muted: '#64748B',
          subtle: '#94A3B8',
          border: '#E2E8F0',
          'border-light': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(18, 59, 93, 0.05), 0 1px 2px -1px rgba(18, 59, 93, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(18, 59, 93, 0.08), 0 8px 10px -6px rgba(18, 59, 93, 0.04)',
        'float': '0 20px 25px -5px rgba(18, 59, 93, 0.12), 0 8px 10px -6px rgba(18, 59, 93, 0.08)',
        'glow-teal': '0 0 20px -3px rgba(15, 139, 141, 0.35)',
        'glow-orange': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
}
