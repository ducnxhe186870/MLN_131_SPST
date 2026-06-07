/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'premium-red': '#8B1E1E',
        'premium-gold': '#D4AF37',
        'dark-graphite': '#121212',
        'paper-white': '#FAFAFA',
        'card-glass': 'rgba(255, 255, 255, 0.03)',
        'card-glass-light': 'rgba(255, 255, 255, 0.7)',
        'military-green': '#4A5D23',
        'flag-red': '#DA251D',
        'rice-yellow': '#F4D03F',
        'vintage-paper': '#F5E6D3',
        'vintage-dark': '#2C2A29',
        'vintage-border': '#D1C2A5',
        // Custom intermediate colors used in components
        'red-550': '#e53535',
        'red-650': '#cd2121',
        'red-750': '#a91b1b',
        'amber-550': '#e78a08',
        'orange-550': '#f26511',
        'orange-650': '#d64c0c',
        'orange-655': '#cd470c',
        'emerald-550': '#0ba775',
        'emerald-650': '#04875f',
        'slate-450': '#7c8ba1',
        'slate-550': '#556477',
        'slate-750': '#283548',
        'slate-850': '#162030',
        'slate-205': '#e0e6ee',
        'slate-250': '#d4dbe4',
        'slate-350': '#aebad0',
        'slate-355': '#a7b3c9',
        'slate-555': '#566579',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
