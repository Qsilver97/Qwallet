import React, { ReactNode, useState } from "react";
import {
  Box,
  HStack,
  Text,
  Pressable,
  Icon,
  VStack,
  useDisclose,
} from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";
import { useColors } from "@app/context/ColorContex";

interface CollapsibleViewProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const CollapsibleView: React.FC<CollapsibleViewProps> = ({
  title,
  children,
  icon,
}) => {
  const { isOpen, onToggle } = useDisclose();
  const { panelBgColor } = useColors();
  return (
    <Box mb="2" mx="2">
      <Pressable
        onPress={onToggle}
        bgColor={panelBgColor}
        _pressed={{ opacity: 0.6 }}
        rounded="md"
      >
        <HStack justifyContent="space-between" alignItems="center" p={4}>
          <HStack space={4}>
            {icon}
            <Text fontWeight="bold" fontSize="md">
              {title}
            </Text>
          </HStack>
          <Icon as={AntDesign} name={isOpen ? "up" : "down"} size="sm" />
        </HStack>
      </Pressable>
      {isOpen && (
        <VStack space={1} p={2}>
          {children}
        </VStack>
      )}
    </Box>
  );
};

export default CollapsibleView;
