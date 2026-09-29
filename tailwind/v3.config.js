/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['../v3.html'] },
  theme: {
    extend: {
      colors: { graphite: '#1E293B', lightgray: '#F1F5F9', amberaccent: '#B45309' },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
    },
  },
};
