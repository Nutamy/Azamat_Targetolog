/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['../v2.html'] },
  theme: {
    extend: {
      colors: {
        neoBg: '#F8FAFC', neoText: '#0F172A', neoBlue: '#2563EB', neoPurple: '#4F46E5',
        neoYellow: '#FACC15', neoPink: '#DB2777', neoGreen: '#22C55E',
      },
      fontFamily: { sans: ['Montserrat', 'sans-serif'] },
      borderWidth: { 3: '3px' },
      boxShadow: {
        neo: '4px 4px 0px 0px rgba(15, 23, 42, 1)',
        'neo-lg': '6px 6px 0px 0px rgba(15, 23, 42, 1)',
        'neo-blue': '4px 4px 0px 0px #2563EB',
        'neo-active': '2px 2px 0px 0px rgba(15, 23, 42, 1)',
      },
    },
  },
};
