export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ev: { deep: '#064B2E', main: '#087A43', secondary: '#20A45A', light: '#E8F5EC', tint: '#D1EBDA' },
        ui: { page: '#F6F9F7', card: '#FFFFFF', line: '#E9EEEA', ink: '#183B2C', muted: '#7C8982', tertiary: '#8E8E93' },
        status: { todo: '#C8CECA', doing: '#8AB5D6', done: '#75B88A', review: '#AD98CB', waiting: '#D4B868', fix: '#D58C88' },
      },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '22px', panel: '20px', control: '13px', pill: '999px' },
      boxShadow: { card: '0 1px 2px rgba(0,0,0,.035), 0 8px 24px rgba(20,40,28,.055)', popover: '0 16px 44px rgba(17,34,23,.16)' },
      transitionTimingFunction: { ios: 'cubic-bezier(.32,.72,0,1)' },
    },
  },
  plugins: [],
};
