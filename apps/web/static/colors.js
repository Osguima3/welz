/**
 * Color palette based on the Welz logo
 * Generated from the gradient colors: #403E43 to #1EAEDB
 */

export const colors = {
  // Primary Colors - from logo gradient
  primary: {
    dark: '#403E43', // Dark gray from logo gradient start
    main: '#1EAEDB', // Blue from logo gradient end
    light: '#5FC8E8', // Lighter version of the blue
    white: '#FFFFFF', // White from the logo lines
  },

  // Secondary Colors - complementary to the blue
  secondary: {
    main: '#DB621E', // Complementary orange to blue
    light: '#F08A4B', // Lighter orange
    dark: '#A44D18', // Darker orange
  },

  // Neutral palette - variations of the gray
  neutral: {
    black: '#1A191B', // Near black
    darkGray: '#403E43', // Dark gray from logo
    gray: '#6B686F', // Medium gray
    lightGray: '#9D9BA1', // Light gray
    platinum: '#E5E5E7', // Very light gray
    white: '#FFFFFF', // White
  },

  // Accent colors
  accent: {
    success: '#2ECC71', // Green
    warning: '#F1C40F', // Yellow
    error: '#E74C3C', // Red
    info: '#3498DB', // Another blue shade
  },

  // Background variations
  background: {
    dark: '#2C2B2F', // Dark mode background
    light: '#F5F5F7', // Light mode background
    gradient: 'linear-gradient(135deg, #403E43 0%, #1EAEDB 100%)', // Logo gradient
  },
};

// Theme configuration object for easy theme switching
export const themes = {
  light: {
    background: colors.background.light,
    text: colors.neutral.black,
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    border: colors.neutral.lightGray,
  },
  dark: {
    background: colors.background.dark,
    text: colors.neutral.white,
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    border: colors.neutral.darkGray,
  },
};
