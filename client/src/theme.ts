import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  primary:   '#210535',
  secondary: '#430d4b',
  accent:    '#7b337d',
  pink:      '#c874b2',
  cream:     '#f5d5e0',
};

// Helper function (handles positive & negative amount)
function lightenColor(color: string, amount: number) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  function blend(c: number) {
    if (amount > 0) {
      return Math.min(255, Math.floor(c + (255 - c) * amount));
    } else {
      return Math.max(0, Math.floor(c * (1 + amount)));
    }
  }

  return (
    '#' +
    [r, g, b]
      .map(blend)
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: lightenColor(colors.primary, 0.2),
      dark: lightenColor(colors.primary, -0.2),
      contrastText: colors.cream,
    },
    secondary: {
      main: colors.accent,
      light: lightenColor(colors.accent, 0.2),
      dark: lightenColor(colors.accent, -0.2),
      contrastText: colors.primary,
    },
    error: {
      main: colors.accent,
      light: lightenColor(colors.accent, 0.2),
      dark: lightenColor(colors.accent, -0.2),
      contrastText: colors.cream,
    },
    warning: {
      main: colors.pink,
      light: lightenColor(colors.pink, 0.2),
      dark: lightenColor(colors.pink, -0.2),
      contrastText: colors.primary,
    },
    info: {
      main: colors.secondary,
      light: lightenColor(colors.secondary, 0.2),
      dark: lightenColor(colors.secondary, -0.2),
      contrastText: colors.cream,
    },
    success: {
      main: '#4CAF50',
      light: lightenColor('#4CAF50', 0.2),
      dark: lightenColor('#388E3C', -0.2),
      contrastText: colors.cream,
    },
    background: {
      default: colors.cream,
      paper: lightenColor(colors.cream, -0.03), // Slightly darker than default
      // @ts-ignore
      alt: lightenColor(colors.primary, 0.95),
    },
    text: {
      primary: colors.primary,
      secondary: colors.accent,
      disabled: lightenColor(colors.primary, 0.4),
    },
    divider: lightenColor(colors.primary, 0.7),
    action: {
      active: colors.primary,
      hover: lightenColor(colors.primary, 0.9),
      selected: lightenColor(colors.accent, 0.8),
      disabled: lightenColor(colors.primary, 0.6),
      disabledBackground: lightenColor(colors.cream, 0.5),
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: colors.primary, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, color: colors.primary, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3, color: colors.primary },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
    h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: colors.primary },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: colors.accent },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: colors.accent },
    overline: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.accent },
  },
  spacing: 8,
  shape: { borderRadius: 12 },
});

export default theme;


//TODO: VARIANT 2
// import { createTheme } from '@mui/material/styles';
//
// // Block Blast Game Palette
// const colors = {
//   primary:   '#8F43EE', // bright purple
//   dark:      '#2D0636', // deep purple/black
//   secondary: '#2AB7CA', // electric blue
//   yellow:    '#FCEE09', // neon yellow
//   pink:      '#F38BA0', // soft pink
//   background:'#FFF6E9', // neutral cream
// };
//
// // Helper function (positive = lighten, negative = darken)
// function lightenColor(color: string, amount: number) {
//   const hex = color.replace('#', '');
//   const r = parseInt(hex.substr(0, 2), 16);
//   const g = parseInt(hex.substr(2, 2), 16);
//   const b = parseInt(hex.substr(4, 2), 16);
//
//   function blend(c: number) {
//     if (amount > 0) {
//       return Math.min(255, Math.floor(c + (255 - c) * amount));
//     } else {
//       return Math.max(0, Math.floor(c * (1 + amount)));
//     }
//   }
//
//   return (
//     '#' +
//     [r, g, b]
//       .map(blend)
//       .map((c) => c.toString(16).padStart(2, '0'))
//       .join('')
//   );
// }
//
// const theme = createTheme({
//   palette: {
//     mode: 'light',
//     primary: {
//       main: colors.primary,
//       light: lightenColor(colors.primary, 0.2),
//       dark: lightenColor(colors.primary, -0.2),
//       contrastText: colors.background,
//     },
//     secondary: {
//       main: colors.secondary,
//       light: lightenColor(colors.secondary, 0.2),
//       dark: lightenColor(colors.secondary, -0.2),
//       contrastText: colors.dark,
//     },
//     error: {
//       main: colors.pink,
//       light: lightenColor(colors.pink, 0.2),
//       dark: lightenColor(colors.pink, -0.2),
//       contrastText: colors.dark,
//     },
//     warning: {
//       main: colors.yellow,
//       light: lightenColor(colors.yellow, 0.2),
//       dark: lightenColor(colors.yellow, -0.2),
//       contrastText: colors.dark,
//     },
//     info: {
//       main: colors.secondary,
//       light: lightenColor(colors.secondary, 0.2),
//       dark: lightenColor(colors.secondary, -0.2),
//       contrastText: colors.background,
//     },
//     success: {
//       main: '#4CAF50', // You can swap this for another accent if you want
//       light: lightenColor('#4CAF50', 0.2),
//       dark: lightenColor('#388E3C', -0.2),
//       contrastText: colors.background,
//     },
//     background: {
//       default: colors.background,
//       paper: lightenColor(colors.background, -0.03),
//       // @ts-ignore
//       alt: lightenColor(colors.primary, 0.95),
//     },
//     text: {
//       primary: colors.dark,
//       secondary: colors.primary,
//       disabled: lightenColor(colors.dark, 0.4),
//     },
//     divider: lightenColor(colors.primary, 0.7),
//     action: {
//       active: colors.primary,
//       hover: lightenColor(colors.primary, 0.9),
//       selected: lightenColor(colors.secondary, 0.8),
//       disabled: lightenColor(colors.dark, 0.6),
//       disabledBackground: lightenColor(colors.background, 0.5),
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: colors.dark, letterSpacing: '-0.02em' },
//     h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, color: colors.dark, letterSpacing: '-0.01em' },
//     h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3, color: colors.dark },
//     h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
//     h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
//     h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, color: colors.primary },
//     body1: { fontSize: '1rem', lineHeight: 1.6, color: colors.dark },
//     body2: { fontSize: '0.875rem', lineHeight: 1.5, color: colors.secondary },
//     button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
//     caption: { fontSize: '0.75rem', lineHeight: 1.4, color: colors.pink },
//     overline: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.yellow },
//   },
//   spacing: 8,
//   shape: { borderRadius: 12 },
// });
//
// export default theme;

//TDDO: VARIANT 3
// import { createTheme } from '@mui/material/styles';
//
// // Block Blast Game Palette (Dark Mode)
// const colors = {
//   primary:   '#8F43EE', // bright purple (main)
//   dark:      '#2D0636', // deep purple/black (backgrounds)
//   secondary: '#2AB7CA', // electric blue (accents)
//   yellow:    '#FCEE09', // neon yellow (score/warning)
//   pink:      '#F38BA0', // soft pink (error/cute details)
//   background:'#211124', // extra dark, nearly black (customized for bg)
//   paper:     '#2D0636', // slightly lighter than bg
// };
//
// // Helper function (positive = lighten, negative = darken)
// function lightenColor(color: string, amount: number) {
//   const hex = color.replace('#', '');
//   const r = parseInt(hex.substr(0, 2), 16);
//   const g = parseInt(hex.substr(2, 2), 16);
//   const b = parseInt(hex.substr(4, 2), 16);
//
//   function blend(c: number) {
//     if (amount > 0) {
//       return Math.min(255, Math.floor(c + (255 - c) * amount));
//     } else {
//       return Math.max(0, Math.floor(c * (1 + amount)));
//     }
//   }
//
//   return (
//     '#' +
//     [r, g, b]
//       .map(blend)
//       .map((c) => c.toString(16).padStart(2, '0'))
//       .join('')
//   );
// }
//
// const theme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: colors.primary,
//       light: lightenColor(colors.primary, 0.18),
//       dark: lightenColor(colors.primary, -0.18),
//       contrastText: '#fff',
//     },
//     secondary: {
//       main: colors.secondary,
//       light: lightenColor(colors.secondary, 0.15),
//       dark: lightenColor(colors.secondary, -0.15),
//       contrastText: colors.dark,
//     },
//     error: {
//       main: colors.pink,
//       light: lightenColor(colors.pink, 0.13),
//       dark: lightenColor(colors.pink, -0.18),
//       contrastText: '#fff',
//     },
//     warning: {
//       main: colors.yellow,
//       light: lightenColor(colors.yellow, 0.1),
//       dark: lightenColor(colors.yellow, -0.2),
//       contrastText: colors.dark,
//     },
//     info: {
//       main: colors.secondary,
//       light: lightenColor(colors.secondary, 0.15),
//       dark: lightenColor(colors.secondary, -0.15),
//       contrastText: colors.dark,
//     },
//     success: {
//       main: '#4CAF50',
//       light: lightenColor('#4CAF50', 0.2),
//       dark: lightenColor('#388E3C', -0.2),
//       contrastText: '#fff',
//     },
//     background: {
//       default: colors.background, // extra dark
//       paper: colors.paper, // dark card/panel
//       // @ts-ignore
//       alt: lightenColor(colors.dark, 0.1),
//     },
//     text: {
//       primary: '#fff',
//       secondary: lightenColor(colors.primary, 0.45),
//       disabled: lightenColor(colors.dark, 0.5),
//     },
//     divider: lightenColor(colors.dark, 0.3),
//     action: {
//       active: colors.primary,
//       hover: lightenColor(colors.primary, 0.3),
//       selected: lightenColor(colors.secondary, 0.6),
//       disabled: lightenColor(colors.dark, 0.4),
//       disabledBackground: lightenColor(colors.dark, 0.25),
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: '#fff', letterSpacing: '-0.02em' },
//     h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, color: colors.primary, letterSpacing: '-0.01em' },
//     h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3, color: colors.primary },
//     h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, color: colors.secondary },
//     h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, color: colors.secondary },
//     h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, color: colors.secondary },
//     body1: { fontSize: '1rem', lineHeight: 1.6, color: '#fff' },
//     body2: { fontSize: '0.875rem', lineHeight: 1.5, color: colors.primary },
//     button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em', color: colors.yellow },
//     caption: { fontSize: '0.75rem', lineHeight: 1.4, color: colors.pink },
//     overline: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.yellow },
//   },
//   spacing: 8,
//   shape: { borderRadius: 12 },
// });
//
// export default theme;

