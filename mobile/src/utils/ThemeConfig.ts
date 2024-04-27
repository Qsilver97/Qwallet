import { extendTheme } from "native-base";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
});

export type ThemeType = typeof theme;
export default theme;
