import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  teal: '#335C67',
  cream: '#FFF3B0',
  orange: '#E09F3E',
  red: '#9E2A2B',
  darkRed: '#540B0E',
};

// Helper functions
function lightenColor(color: string, amount: number) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (
    '#' +
    [r, g, b]
      .map((c) => Math.min(255, Math.floor(c + (255 - c) * amount))
        .toString(16).padStart(2, '0'))
      .join('')
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.teal,
      light: lightenColor(colors.teal, 0.2),
      dark: lightenColor(colors.teal, -0.2),
      contrastText: colors.cream,
    },
    secondary: {
      main: colors.orange,
      light: lightenColor(colors.orange, 0.2),
      dark: lightenColor(colors.orange, -0.2),
      contrastText: colors.darkRed,
    },
    error: {
      main: colors.red,
      light: lightenColor(colors.red, 0.2),
      dark: lightenColor(colors.red, -0.2),
      contrastText: colors.cream,
    },
    warning: {
      main: colors.orange,
      light: lightenColor(colors.orange, 0.2),
      dark: lightenColor(colors.orange, -0.2),
      contrastText: colors.darkRed,
    },
    info: {
      main: colors.teal,
      light: lightenColor(colors.teal, 0.2),
      dark: lightenColor(colors.teal, -0.2),
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
      paper: '#FFFBF0',
      // @ts-ignore
      alt: lightenColor(colors.teal, 0.95),
    },
    text: {
      primary: colors.darkRed,
      secondary: colors.red,
      disabled: lightenColor(colors.darkRed, 0.4),
    },
    divider: lightenColor(colors.teal, 0.7),
    action: {
      active: colors.teal,
      hover: lightenColor(colors.teal, 0.9),
      selected: lightenColor(colors.orange, 0.8),
      disabled: lightenColor(colors.darkRed, 0.6),
      disabledBackground: lightenColor(colors.cream, 0.5),
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: colors.darkRed, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, color: colors.darkRed, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3, color: colors.darkRed },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, color: colors.darkRed },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, color: colors.darkRed },
    h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, color: colors.darkRed },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: colors.darkRed },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: colors.red },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: colors.red },
    overline: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.red },
  },
  spacing: 8,
  shape: { borderRadius: 12 },
});

export default theme;
