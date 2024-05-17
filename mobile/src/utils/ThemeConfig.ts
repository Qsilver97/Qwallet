import { extendTheme } from "native-base";

const getTheme = (colorMode:string) => {
  return extendTheme({
    config: {
      initialColorMode: colorMode,
    },
  });
};

export default getTheme;