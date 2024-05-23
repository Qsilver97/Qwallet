const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "languages.json");

function addTranslation(keyPath, translations, filePath = "languages.json") {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    const languageData = JSON.parse(data);

    const keys = keyPath.split(".");
    const translationKey = keys.pop();

    function setNested(obj, keys, value) {
      if (keys.length === 0) return value;
      const key = keys.shift();
      if (!obj[key]) obj[key] = {};
      obj[key] = setNested(obj[key], keys, value);
      return obj;
    }

    for (const lang in translations) {
      if (!languageData[lang]) {
        languageData[lang] = {};
      }
      languageData[lang] = setNested(
        languageData[lang],
        [...keys, translationKey],
        translations[lang]
      );
    }

    fs.writeFile(
      filePath,
      JSON.stringify(languageData, null, 2),
      "utf-8",
      (err) => {
        if (err) throw err;
        console.log("Translations added successfully!");
      }
    );
  });
}

function deleteKeyPath(keyPath, filePath = "languages.json") {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    const languageData = JSON.parse(data);

    const keys = keyPath.split(".");

    function deleteNested(obj, keys) {
      const key = keys.shift();
      if (keys.length === 0) {
        delete obj[key];
        return;
      }
      if (obj[key]) {
        deleteNested(obj[key], keys);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    }

    for (const lang in languageData) {
      deleteNested(languageData[lang], [...keys]);
    }

    fs.writeFile(
      filePath,
      JSON.stringify(languageData, null, 2),
      "utf-8",
      (err) => {
        if (err) throw err;
        console.log("Key path deleted successfully!");
      }
    );
  });
}

// Example
const keyPath = "Main.Orderbook.ConfirmSell";
const newTranslations = {
  en: "Do you really want to sell {amount} {currentToken} as {price} QU?",
  zh: "你真的想以 {price} QU 卖 {amount} 个 {currentToken} 吗？",
  es: "¿Realmente quieres vender {amount} {currentToken} por {price} QU?",
  fr: "Voulez-vous vraiment vendre {amount} {currentToken} pour {price} QU ?",
  de: "Möchten Sie wirklich {amount} {currentToken} für {price} QU verkaufen?",
  ja: "{amount} {currentToken} を {price} QU で売りますか？",
  ru: "Вы действительно хотите продать {amount} {currentToken} за {price} QU?",
};

addTranslation(keyPath, newTranslations);
// deleteKeyPath(keyPath);
