import type { Config } from "tailwindcss";

/**
 * Sistema de cores — Identidade visual "Pratik Turismo".
 * Extraído do logo: colinas verdes, sol amarelo/laranja e a marca em grafite.
 *  - primary  -> verde das colinas (cor de marca / CTAs secundários, links, destaques)
 *  - accent   -> laranja do sol (CTAs principais, badges de urgência)
 *  - sun      -> amarelo do sol (gradientes)
 *  - secondary-> grafite do wordmark (fundos escuros, textos fortes)
 */
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
        // Verde das colinas do logo
        primary: {
          DEFAULT: '#5E9E20',
          dark: '#4A7C1A',
          light: '#EAF5DE',
          50: '#F4F9EC',
          100: '#E5F1D0',
          200: '#CCE4A6',
          300: '#ADD675',
          400: '#90C84B',
          500: '#76B82F',
          600: '#5E9E20',
          700: '#4A7C1A',
          800: '#3C6118',
          900: '#335018',
        },
        // Grafite do wordmark "Pratik"
        secondary: {
          DEFAULT: '#2D2D2D',
          light: '#3F3F3F',
        },
        // Laranja do sol
        accent: {
          DEFAULT: '#F39200',
          dark: '#D77E00',
          light: '#FFF1DC',
          50: '#FFF8EC',
          100: '#FFEFCF',
          200: '#FFDC9E',
          300: '#FFC264',
          400: '#FBA82E',
          500: '#F39200',
          600: '#D77E00',
          700: '#B26500',
          800: '#8F5006',
          900: '#76430B',
        },
        // Amarelo do sol (gradientes / brilhos)
        sun: {
          DEFAULT: '#FBB034',
          light: '#FFD15C',
        },
        urgent: {
          DEFAULT: '#F39200',
          dark: '#D77E00',
        },
        // Verde mais vivo do logo para selos de sucesso
        success: {
          DEFAULT: '#76B82F',
          dark: '#5E9E20',
        },
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(45, 45, 45, 0.12)',
        'premium-hover': '0 20px 40px -15px rgba(45, 45, 45, 0.18)',
        'soft': '0 4px 6px -1px rgba(45, 45, 45, 0.05), 0 2px 4px -1px rgba(45, 45, 45, 0.03)',
        'brand': '0 10px 25px -8px rgba(94, 158, 32, 0.45)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'sun-gradient': 'linear-gradient(135deg, #FFD15C 0%, #FBB034 45%, #F39200 100%)',
        'hill-gradient': 'linear-gradient(135deg, #76B82F 0%, #5E9E20 100%)',
        // Assinatura da marca: colinas (verde) nascendo para o sol (laranja)
        'brand-gradient': 'linear-gradient(120deg, #5E9E20 0%, #76B82F 35%, #FBB034 75%, #F39200 100%)',
      },
      fontFamily: {
        // Corpo de texto
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        // Títulos / wordmark da marca (geométrica arredondada, ecoa o logo "Pratik")
        display: ['var(--font-poppins)', 'var(--font-inter)', 'sans-serif'],
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
