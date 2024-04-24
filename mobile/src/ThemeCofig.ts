import { extendTheme } from "native-base";

const theme = extendTheme({
  colors: {
    main: {
      darkGunmetal: "#192B3B",
      babyBlue: "#B4CCF9",
      hakesBlue: "#D2E0FC",
      moonStoneBlue: "#879FCB",
      crystalBlue: "#59B2F6",
      jeansBlue: "#59B2F6",
      celetialBlue: "#2C91DE",
    },
    dark: {
      bgColor: "#192B3B",
      textColor: "#FFFFFF",
      btnBgColor: "#2C91DE",
    },
    light: {
      bgColor: "#FFFFFF",
      textColor: "#333333",
      btnBgColor: "#FFFFFF",
    },
  },
  config: {
    initialColorMode: "dark",
  },
});

export type ThemeType = typeof theme;
export default theme;
