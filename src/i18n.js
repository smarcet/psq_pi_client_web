import T from "i18n-react/dist/i18n-react";

let language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

console.log(`user language is ${language}`);

T.setTexts(require(`./i18n/${language}.json`));
