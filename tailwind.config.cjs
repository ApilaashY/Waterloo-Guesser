/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				dangrek: ['Dangrek', 'sans-serif'],
				casko: ['Casko', 'sans-serif'],
				calista: ['Calista', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
