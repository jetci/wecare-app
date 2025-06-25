/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976D2',
        primaryLight: '#E3F2FD',
        accent: '#1565C0',
        danger: '#EF5350',
        success: '#2E7D32',
        neutral: '#F9FAFB',
        textMain: '#1E293B',
      },
    },
  },
  plugins: [],
}
