/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0c0a07',
        'bg-elevated': '#181410',
        'bg-surface': '#1f1b14',
        gold: '#c9a84c',
        'gold-dim': '#8b6914',
        'gold-bright': '#e8c870',
        'text-primary': '#f0e8d8',
        'text-dim': '#b8a888',
        'text-muted': '#7a6a50',
      },
    },
  },
  plugins: [],
};
