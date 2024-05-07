import LocalizedStrings from "react-native-localization";
import lang from "./languages.json";

const local = new LocalizedStrings({
  zh: lang.zh,
//   en: lang.en,
});

export default local;
