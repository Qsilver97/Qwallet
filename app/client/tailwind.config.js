/** @type {import('tailwindcss').Config} */
export default {
    mode: "jit",
    purge: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class", // or 'media' or 'class'
    content: [],
    theme: {
        extend: {
            colors: {
                dark: "#1C1C1C",
                darkGunmetal: "#192B3B",
                babyBlue: "#B4CCF9",
                hawakesBlue: "#D2E0FC",
                moonstoneBlue: "#879FCB",
                crystalBlue: "#59B2F6",
                jeansBlue: "#8BCDFF",
                celestialBlue: "#2C91DE",
                "dark-input": "#16161E",
                gray: "#898CA9",
                "dark-gray": {
                    400: "#707070",
                    500: "#878787",
                },
                "dark-blue": "#13098B",
                inactive: "#6A6A6D",
            },
        },
        fontFamily: {
            Montserrat: ["Montserrat", "sans-serif"],
            Inter: ["Inter", "sans-serif"],
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
