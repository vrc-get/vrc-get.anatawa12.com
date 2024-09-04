const PLATFORMS = {
    macOS: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    android: 'Android',
    iOS: 'iOS',
    unknown: 'Other',
    current: undefined,
};

function detectPlatform() {
    const platform = window.navigator?.userAgentData?.platform || window.navigator.platform || 'Unknown';
    const lowerCasePlatfrom = platform.toLowerCase();

    if (lowerCasePlatfrom.indexOf('mac') !== -1) {
        return PLATFORMS.macOS;
    } else if (lowerCasePlatfrom.indexOf('win') !== -1) {
        return PLATFORMS.windows;
    } else if (/Linux/.test(platform)) {
        return PLATFORMS.linux;
    } else if (lowerCasePlatfrom == 'android') {
        return PLATFORMS.android;
    } else if (lowerCasePlatfrom == 'ios' || platform == 'ipad' || platform == 'ipod') {
        return PLATFORMS.iOS;
    } else {
        console.log('Unknown platform: ' + platform);
        return PLATFORMS.unknown;
    }
}

PLATFORMS.current = detectPlatform();
Object.freeze(PLATFORMS);
