module.exports = {
  content: [
    './src/**/*.{vue,js}',
    './build.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00abd1',
          50: '#e6f7fb',
          100: '#b3e7f4',
          500: '#00abd1',
          600: '#0095b8',
          700: '#00809f'
        },
        secondary: {
          DEFAULT: '#eae9ec',
          500: '#d4d3d8',
          700: '#a8a7af'
        },
        accent: {
          DEFAULT: '#36344c',
          500: '#36344c',
          700: '#242333'
        },
        success: '#19cd9d',
        warning: '#ed9119',
        error: '#e03629',
        info: '#413e5b'
      },
      fontFamily: {
        sans: ['"Open Sans"', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      },
      fontSize: {
        base: '14px'
      },
      spacing: {
        unit: '8px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

