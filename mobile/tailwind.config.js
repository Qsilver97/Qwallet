/** @type {import('tailwindcss').Config} */
export default {
    mode: 'jit',
    purge: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class', // or 'media' or 'class'
    content: [],
    theme: {
        extend: {
            colors: {
                light: '#e0e0e0', // Light mode background
                dark: '#1A202C', // Dark mode background
            },
            backgroundColor: {
                light: 'rgba(230,230,230,0.8)', // Light mode background
                dark: 'rgba(3,35,61,0.8)', // Dark mode background
            },
            textColor: {
                light: 'rgba(3,35,61)', // Light mode text
                dark: '#FFFFFF', // Dark mode text
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
