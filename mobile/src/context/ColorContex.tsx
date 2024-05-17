import React, { ReactNode, createContext, useContext } from "react";
import { useColorModeValue, NativeBaseProvider } from "native-base";
import colors from "../utils/colors";

interface ColorContextState {
  bgColor: string;
  textColor: string;
  btnBgColor: string;
  panelBgColor: string;
  selectedPanelBgColor: string;
  toast: {
    textColor: string;
    bgColor: string;
  };
  main: {
    darkGunmetal: string;
    babyBlue: string;
    hakesBlue: string;
    moonStoneBlue: string;
    crystalBlue: string;
    jeansBlue: string;
    celestialBlue: string;
  };
  gray: {
    gray80: string;
    gray60: string;
    gray50: string;
    gray40: string;
    gray30: string;
    gray20: string;
    gray10: string;
  };
}
interface ColorProviderProps {
  children: ReactNode;
}
const ColorContext = createContext<ColorContextState | undefined>(undefined);

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const bgColor = useColorModeValue(colors.light.bgColor, colors.dark.bgColor);
  const textColor = useColorModeValue(
    colors.light.textColor,
    colors.dark.textColor
  );
  const btnBgColor = useColorModeValue(
    colors.light.btnBgColor,
    colors.dark.btnBgColor
  );
  const toast = useColorModeValue(
    { textColor: colors.dark.textColor, bgColor: "#20304C" },
    { textColor: colors.light.textColor, bgColor: "#EDF1F9" }
  );
  const panelBgColor = useColorModeValue(
    colors.light.panelBgColor,
    colors.dark.panelBgColor
  );
  const selectedPanelBgColor = useColorModeValue(
    colors.light.selectedPanelBgColor,
    colors.dark.selectedPanelBgColor
  );
  return (
    <ColorContext.Provider
      value={{
        bgColor,
        textColor,
        btnBgColor,
        panelBgColor,
        selectedPanelBgColor,
        toast,
        main: colors.main,
        gray: colors.gray,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorProvider");
  }
  return context;
};
