tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#7abfba',
                primaryHover: '#66a39e',
                secondary: '#FFFFFF',
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-in-out',
                fadeOut: 'fadeOut 0.5s ease-in-out',
                slideDown: 'slideDown 0.3s ease-out',
                stickSlide: 'stickSlide 0.3s ease-out',
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
                slideDown: {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                stickSlide: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' },
                }
            }
        }
    }
};