/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            spacing: {
                56: "14rem",
            },
            zIndex: {
                40: "40",
                50: "50",
            },
        },
    },
    plugins: [],
};
