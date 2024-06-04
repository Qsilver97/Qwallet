import { Icon } from "native-base";
import {
  BaseToast,
  ToastConfig,
  BaseToastProps,
} from "react-native-toast-message";
import { AntDesign } from "@expo/vector-icons";
import { useColors } from "@app/context/ColorContex";

const defaultProps = {
  style: {
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    borderLeftWidth: 0,
    padding: 4,
    paddingLeft: 10,
    shadowColor: "#444444",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  text1Style: {
    fontSize: 18,
    fontFamily: "Arial",
    fontWeight: "normal",
  },
};

const toastConfig: ToastConfig = {
  success: (props: BaseToastProps) => {
    const { toast } = useColors();
    return (
      <BaseToast
        {...props}
        style={
          {
            ...defaultProps.style,
            backgroundColor: toast.bgColor,
          } as any
        }
        text1Style={
          {
            ...defaultProps.text1Style,
            color: toast.textColor,
          } as any
        }
        renderLeadingIcon={() => (
          <Icon
            as={AntDesign}
            name="checkcircle"
            size="3xl"
            color="green.500"
          ></Icon>
        )}
      ></BaseToast>
    );
  },
  info: (props: BaseToastProps) => {
    const { toast } = useColors();
    return (
      <BaseToast
        {...props}
        style={
          {
            ...defaultProps.style,
            backgroundColor: toast.bgColor,
          } as any
        }
        text1Style={
          {
            ...defaultProps.text1Style,
            color: toast.textColor,
          } as any
        }
        renderLeadingIcon={() => (
          <Icon
            as={AntDesign}
            name="exclamationcircle"
            size="3xl"
            color="blue.500"
          ></Icon>
        )}
      ></BaseToast>
    );
  },
  error: (props: BaseToastProps) => {
    const { toast } = useColors();
    return (
      <BaseToast
        {...props}
        style={
          {
            ...defaultProps.style,
            backgroundColor: toast.bgColor,
          } as any
        }
        text1Style={
          {
            ...defaultProps.text1Style,
            color: toast.textColor,
          } as any
        }
        renderLeadingIcon={() => (
          <Icon
            as={AntDesign}
            name="closecircle"
            size="3xl"
            color="red.500"
          ></Icon>
        )}
      ></BaseToast>
    );
  },
};

export default toastConfig;
