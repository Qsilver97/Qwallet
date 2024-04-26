import React, { ReactNode, createContext, useContext } from "react";
import { useColorModeValue, NativeBaseProvider } from "native-base";

interface ColorContextState {
  bgColor: string;
  textColor: string;
  btnBgColor: string;
}
interface ColorProviderProps {
  children: ReactNode;
}
const ColorContext = createContext<ColorContextState | undefined>(undefined);

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const bgColor = useColorModeValue("light.bgColor", "dark.bgColor");
  const textColor = useColorModeValue("light.textColor", "dark.textColor");
  const btnBgColor = useColorModeValue("light.btnBgColor", "dark.btnBgColor");
  return (
    <ColorContext.Provider value={{ bgColor, textColor, btnBgColor }}>
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
