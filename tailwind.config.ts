import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Mantido por segurança para migrações graduais
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7', // Sky 600
          dark: '#0369a1',    // Sky 700
          light: '#e0f2fe',   // Sky 100
        },
        secondary: {
          DEFAULT: '#0f172a', // Slate 900
          light: '#1e293b',
        },
        accent: {
          DEFAULT: '#f97316', // Orange 500
          dark: '#ea580c',
          light: '#ffedd5',
        },
        urgent: {
          DEFAULT: '#f97316', // Orange 500
          dark: '#ea580c',    // Orange 600
        },
        success: {
          DEFAULT: '#84cc16', // Lime 500
          dark: '#65a30d',
        },
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};

export default config;