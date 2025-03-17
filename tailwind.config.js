/** @type {import('tailwindcss').Config} */
module.exports = {
  // ...existing config
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--foreground)',
            'p:first-of-type': {
              marginTop: '0',
            },
            'p:last-child': {
              marginBottom: '0',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...other plugins
  ],
}