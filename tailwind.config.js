/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',   // zinc-950
        canvas:     '#111113',    // pure neutral dark — zero blue cast
        panel:      '#09090b',   // zinc-950
        border:     '#27272a',   // zinc-800
        primary:    '#fafafa',   // zinc-50 (inverted for dark)
        primaryHover:'#e4e4e7', // zinc-200
        muted:      '#71717a',   // zinc-500
        card:       '#18181b',   // zinc-900
        node: {
          start:    '#4ade80',   // green-400
          task:     '#60a5fa',   // blue-400
          approval: '#fbbf24',   // amber-400
          auto:     '#c084fc',   // purple-400
          ai:       '#f472b6',   // pink-400
          end:      '#f87171',   // red-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
