import T from 'i18n-react';
import { read_cookie } from 'sfcookies';
import {USER_LOCALE_COOKIE_NAME} from "./constants";
let language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

let user_language = read_cookie(USER_LOCALE_COOKIE_NAME)

console.log(`browser language is ${language}`);
console.log(`user language is ${user_language} from cookie`);

if(user_language==null || user_language.length == 0) {
    // set by default browser lang
    T.setTexts(require(`./i18n/${language}.json`));
}
else{
    T.setTexts(require(`./i18n/${user_language}.json`));
}

