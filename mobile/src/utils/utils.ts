import Clipboard from "@react-native-clipboard/clipboard";
import local from "./locales";
import Toast from "react-native-toast-message";

export const checkPasswordStrength = (password: string) => {
  let strength = 0;

  // Criteria 1: Minimum length of 8 characters
  if (password.length >= 8) {
    strength += 1;
  }

  // Criteria 2: Contains both lower and uppercase characters
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
    strength += 1;
  }

  // Criteria 3: Contains digits
  if (password.match(/([0-9])/)) {
    strength += 1;
  }

  // Criteria 4: Contains symbols
  if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
    strength += 1;
  }

  return strength;
};

const lang = local.util.PasswordStrength;

export const getPasswordStrengthProps = (strength: number) => {
  switch (strength) {
    case 4:
      return { label: lang.Perfect, color: "green.600" };
    case 3:
      return { label: lang.Good, color: "green.400" };
    case 2:
      return { label: lang.Normal, color: "yellow.500" };
    case 1:
      return { label: lang.Bad, color: "red.500" };
    default:
      return { label: lang.NotAvailable, color: "gray.500" };
  }
};

export const handleCopy = (txt: string) => {
  Clipboard.setString(txt);
  Toast.show({ type: "success", text1: "Copied!" });
};
