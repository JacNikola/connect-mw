/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef7fb',100:'#d6ecf5',200:'#aedaeb',300:'#7cc2dd',400:'#3fa2c9',500:'#0b86b5',600:'#0076a8',700:'#055f88',800:'#0a4f70',900:'#0d415c' },
        accent: { 50:'#fff4ec',100:'#ffe4d0',200:'#ffc59d',300:'#ffa066',400:'#f9823a',500:'#e8681a',600:'#c95410',700:'#a34112' },
        ink: { 900:'#0f1c2b', 700:'#334155', 500:'#64748b', 300:'#cbd5e1' },
      },
      fontFamily: { sans: ['"Segoe UI"', 'Inter', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(15,28,43,.04), 0 4px 16px rgba(15,28,43,.06)',
        lift: '0 2px 4px rgba(15,28,43,.05), 0 12px 32px rgba(15,28,43,.12)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        popIn: { from: { opacity: 0, transform: 'translateY(8px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        fadeIn: 'fadeIn .2s ease-out',
        popIn: 'popIn .22s cubic-bezier(.2,.9,.3,1.2)',
        slideUp: 'slideUp .3s ease-out both',
      },
    },
  },
  plugins: [],
};
