/**
 * Token desain Jejak Rona dalam bentuk konstanta TypeScript
 */

export const colors = {
  ink950: "#12110D",
  ink900: "#1B1A15",
  ink700: "#3A382F",
  bone50: "#F6F1E9",
  bone100: "#ECE5D9",
  bone300: "#CFC7B8",
  stone500: "#7C766A",
  stone700: "#4D493F",
  moss700: "#3D4A36",
  ember600: "#B5522B",
  paper0: "#FFFFFF",
} as const;

export const fonts = {
  display: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
  ui: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
} as const;

export const radii = {
  ui: "2px",
  dialog: "4px",
  media: "0px",
} as const;

export const transitions = {
  easeOut: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  durFast: "160ms",
  durBase: "400ms",
  durSlow: "700ms",
} as const;
