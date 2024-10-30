const locale = document.documentElement.lang;

async function waitUntilLocaleIsLoaded() {
    while (!window.S) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    return window.S;
}

async function setCustomLocale(newLocale) {
    await waitUntilLocaleIsLoaded();
    if (!(window.S.data.locales[newLocale])) throw `Unsupported locale: ${newLocale}`;
    document.cookie = `customLocale=${newLocale}; path=/;`;
    _redirectToLocale(newLocale);
}

async function _loadLocaleData() {
    const jsonFilePath = `/resources/locales/${locale}.json`;
    const response = await fetch(jsonFilePath);
    if (!response.ok) {
        throw new Error(`Failed to load locale data: ${response.status}`);
    }
    window.S = await response.json();
    Object.freeze(window.S);
}

function _getCustomLocaleCookie() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'customLocale') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

function _redirectToLocale(newLocale) {
    let endpoint = window.location.pathname;
    if (endpoint == `/${locale}` || endpoint.startsWith(`/${locale}/`)) {
        const endOfLocale = endpoint.indexOf('/', 1);
        endpoint = endOfLocale === -1 ? '' : endpoint.slice(endOfLocale);
    }
    endpoint = '/' + newLocale + endpoint;
    window.location.replace(endpoint);
}

async function _checkIfWeShouldRedirect() {
    const customLocale = _getCustomLocaleCookie();
    let browserLocales = Array.from(_getBrowserLocale())

    if (customLocale !== null) {
        if (customLocale != locale) {
            await waitUntilLocaleIsLoaded();
            if (window.S.data.locales[customLocale]) {
                _redirectToLocale(customLocale);
                return;
            } else {
                document.cookie = "customLocale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    } else {
        await waitUntilLocaleIsLoaded();
        for (let browserLocale of browserLocales) {
            browserLocale = browserLocale.toLowerCase();
            browserLocale = _localeMapping[browserLocale] || browserLocale;
            if (browserLocale === locale) {
                return;
            }
            if (window.S.data.locales[browserLocale]) {
                _redirectToLocale(browserLocale);
                return;
            }
        }
    }
}

const _localeMapping = {
    "zh-tw": "zh-hant",
    "zh-cn": "zh-hans",
}

function * _getBrowserLocale() {
    for (let language of navigator.languages) {
        for (let length = language.length; length > 0; length = language.lastIndexOf('-')) {
            language = language.slice(0, length);
            yield language;
        }
    }
}

_loadLocaleData();
_checkIfWeShouldRedirect();
