/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface / background
        background:              '#11131c',
        surface:                 '#11131c',
        'surface-container-low': '#191b25',
        'surface-container':     '#1d1f29',
        'surface-container-high':'#282934',
        'surface-container-highest': '#32343f',
        'surface-container-lowest':  '#0c0e17',
        'surface-bright':        '#373943',
        'surface-variant':       '#32343f',
        'surface-dim':           '#11131c',
        // Text
        'on-surface':            '#e1e1ef',
        'on-surface-variant':    '#cbc3d3',
        'on-background':         '#e1e1ef',
        // Primary (purple)
        primary:                 '#d2bcff',
        'primary-container':     '#7c5cbf',
        'on-primary':            '#3c167c',
        'on-primary-container':  '#f8efff',
        'primary-fixed':         '#eaddff',
        'primary-fixed-dim':     '#d2bcff',
        'inverse-primary':       '#6b4bad',
        // Secondary
        secondary:               '#c6c4da',
        'secondary-container':   '#464557',
        'on-secondary':          '#2f2f40',
        'on-secondary-container':'#b5b3c8',
        // Tertiary (amber)
        tertiary:                '#eac25a',
        'tertiary-container':    '#cca742',
        'on-tertiary':           '#3e2e00',
        // Outlines
        outline:                 '#958e9d',
        'outline-variant':       '#494551',
        // Error
        error:                   '#ffb4ab',
        'error-container':       '#93000a',
        'on-error':              '#690005',
        'on-error-container':    '#ffdad6',
        // Inverse
        'inverse-surface':       '#e1e1ef',
        'inverse-on-surface':    '#2e303a',
        // App-specific custom colours (from design)
        'app-bg':                '#080810',
        'app-card':              '#10101c',
        'app-purple':            '#7c5cbf',
        'app-green':             '#3ecf8e',
        'app-red':               '#f87171',
        'app-green-bg':          '#0d1a12',
        'app-red-bg':            '#1a0d0d',
        'app-border':            '#1e1e2e',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg:      '0.25rem',
        xl:      '0.5rem',
        full:    '0.75rem',
      },
      spacing: {
        gutter:         '1rem',
        sm:             '0.5rem',
        base:           '4px',
        xs:             '0.25rem',
        'container-max':'1200px',
        lg:             '1.5rem',
        md:             '1rem',
        xl:             '2rem',
      },
      fontFamily: {
        'label-sm':   ['"JetBrains Mono"', 'monospace'],
        'body-lg':    ['Geist', 'sans-serif'],
        'body-md':    ['Geist', 'sans-serif'],
        'headline-sm':['Geist', 'sans-serif'],
        'headline-md':['Geist', 'sans-serif'],
        'headline-lg':['Geist', 'sans-serif'],
        'code-md':    ['"JetBrains Mono"', 'monospace'],
        sans:         ['Geist', 'sans-serif'],
        mono:         ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'label-sm':   ['12px', { lineHeight: '1',   letterSpacing: '0.05em', fontWeight: '500' }],
        'body-lg':    ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md':    ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'headline-sm':['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'headline-md':['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-lg':['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'code-md':    ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      maxWidth: {
        'container-max': '1200px',
      },
    },
  },
  plugins: [],
}
