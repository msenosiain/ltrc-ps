import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        // ── LTRC brand ──────────────────────────────────────────────
        primary:     '#a12223',   // rojo institucional (sidebar, botones)
        navy:        '#082846',   // azul navy (badges, elementos secundarios)
        interactive: '#1c5891',   // azul medio (links, tabs activos, estados)
        ink:         '#231f20',   // texto principal
        muted:       '#6b7280',   // texto secundario / dimmed
        surface:     '#ffffff',   // tarjetas y superficies
        background:  '#fafafa',   // fondo de página
        border:      '#e5e7eb',   // bordes y separadores

        // ── Tokens internos para shadcn/ui (Select, Popover, Button ghost) ─
        popover:  { DEFAULT: '#ffffff',   foreground: '#231f20' },
        accent:   { DEFAULT: '#f3f4f6',   foreground: '#082846' },
      },
      fontSize: {
        h1:       ['2.5rem',   { lineHeight: '1.1', fontWeight: '800' }],
        h2:       ['2rem',     { lineHeight: '1.2', fontWeight: '700' }],
        h3:       ['1.5rem',   { lineHeight: '1.3', fontWeight: '600' }],
        subtitle: ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        body:     ['1rem',     { lineHeight: '1.6', fontWeight: '400' }],
        small:    ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '1rem',
        '2xl':'1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        soft: '0 4px 20px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
