export const STUDENT = 1;
export const TEACHER = 2
export const SUPERVISOR = 3;
export const DEFAULT_PAGE_SIZE = 5;

// languages
export const SPANISH = 1;
export const ENGLISH = 2;

export const USER_LOCALE_COOKIE_NAME = 'user.locale';

export const getLanguage = (locale) => {
    let language = null;
    switch(locale){
        case SPANISH:
            language = 'es';
            break
        case ENGLISH:
            language = 'en';
            break
    }
    return language
}