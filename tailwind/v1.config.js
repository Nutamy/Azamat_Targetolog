/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['../v1.html', '../v1.js'] },
  theme: {
    extend: {
      colors: { ink: '#0D0F12', panel: '#161920', accent: '#10B981', 'accent-strong': '#34D399' },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
