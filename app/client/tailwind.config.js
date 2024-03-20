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
                light: '#e0e0e0', // Light mode background
                dark: '#1A202C', // Dark mode background
            },
            textColor: {
                light: '#1A202C', // Light mode text
                dark: '#eee', // Dark mode text
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
