export const hiberusThemeTokens = {
  palette: {
    primary: "#1032CF",
    primaryDark: "#19255A",
    accent: "#5B53FF",
    accentHover: "#4A42E0",
    textPrimary: "#111111",
    textSecondary: "#3A3A3A",
    textInverse: "#FFFFFF",
    surface: "#F7F8FD",
    white: "#FFFFFF"
  },
  typography: {
    heading: "Montserrat, sans-serif",
    body: "Lato, 'Open Sans', 'Helvetica Neue', arial, system-ui, sans-serif"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    section: "80px"
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    pill: "200px"
  }
};

export const selfHostedFontManifest = {
  families: [
    {
      family: "Montserrat",
      recommendedWeights: ["600", "700"],
      projectRelativeTarget: "src/assets/fonts/montserrat/"
    },
    {
      family: "Lato",
      recommendedWeights: ["400", "700"],
      projectRelativeTarget: "src/assets/fonts/lato/"
    }
  ],
  strategy: "self-host",
  cspSafe: true
};
