/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#86288F', // Our custom light purple
          700: '#64126D', // Our custom dark purple
          800: '#581c87',
          900: '#4c1d95',
        },
        purple: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#86288F', // Our custom light purple
          700: '#64126D', // Our custom dark purple
          800: '#581c87',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [],
}
