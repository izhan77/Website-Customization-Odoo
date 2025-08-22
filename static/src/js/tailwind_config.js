tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Your existing colors
                primary: '#7abfba',
                'primary-hover': '#66a39e',
                secondary: '#FFFFFF',
                
                // Additional theme colors for better consistency
                'primary-light': '#a8d3cf',
                'primary-dark': '#5a9a94',
                'gray-50': '#f9fafb',
                'gray-100': '#f3f4f6',
                'gray-200': '#e5e7eb',
                'gray-300': '#d1d5db',
                'gray-400': '#9ca3af',
                'gray-500': '#6b7280',
                'gray-600': '#4b5563',
                'gray-700': '#374151',
                'gray-800': '#1f2937',
                'gray-900': '#111827'
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-in-out',
                fadeOut: 'fadeOut 0.5s ease-in-out',
                slideIn: 'slideIn 0.3s ease-out',
                slideOut: 'slideOut 0.3s ease-in',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                bounce: 'bounce 1s infinite'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeOut: {
                    '0%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { opacity: '0', transform: 'translateY(-10px)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideOut: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            },
            spacing: {
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                'none': 'none',
            },
            screens: {
                'xs': '475px',
            }
        }
    }
};