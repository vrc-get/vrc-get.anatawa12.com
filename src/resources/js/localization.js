const locale = document.documentElement.lang;

async function waitUntilLocaleIsLoaded() {
    while (!window.S) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    return window.S;
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

async function _checkIfWeShouldRedirect() {
    // ToDo
}

_checkIfWeShouldRedirect();
_loadLocaleData();