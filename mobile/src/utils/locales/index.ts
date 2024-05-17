import LocalizedStrings from "react-native-localization";
import lang from "./languages.json";

const local = new LocalizedStrings({
  en: lang.en,
  zh: lang.zh,
  es: lang.es,
  fr: lang.fr,
  ru: lang.ru,
  ja: lang.ja,
  de: lang.de,
});

export default local;
