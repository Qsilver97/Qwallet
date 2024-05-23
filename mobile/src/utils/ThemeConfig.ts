import { extendTheme } from "native-base";

const getTheme = (colorMode: string) => {
  return extendTheme({
    config: {
      initialColorMode: colorMode,
    },
    fontSizes: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 24,
      "2xl": 28,
      "3xl": 32,
      "4xl": 36,
      "5xl": 40,
      "6xl": 48,
    },
  });
};

export default getTheme;
