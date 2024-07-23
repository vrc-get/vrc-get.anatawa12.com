function detectPlatform() {
    const platform = window.navigator?.userAgentData?.platform || window.navigator.platform || 'Unknown';
    const lowerCasePlatfrom = platform.toLowerCase();

    if (lowerCasePlatfrom.indexOf('mac') !== -1) {
        return 'macOS';
    } else if (lowerCasePlatfrom.indexOf('win') !== -1) {
        return 'Windows';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    } else if (lowerCasePlatfrom == 'android') {
        return 'Android';
    } else if (lowerCasePlatfrom == 'ios' || platform == 'ipad' || platform == 'ipod') {
        return 'iOS';
    } else {
        console.log('Unsupported platform: ' + platform);
        return 'Unsupported';
    }
}

let _mainButtonLink;

async function init() {
    await waitUntilLocaleIsLoaded();

    const errorNotification = document.getElementById('err-failedToLoadLatestVersion');
    const loadingButton = document.getElementById('btn-download-loading');
    const errorButton = document.getElementById('btn-download-failed');

    try {
        const response = await fetch('/api/gui/tauri-updater.json')
        const data = await response.json()
        const version = data.version;

        const macLink = `https://github.com/vrc-get/vrc-get/releases/download/gui-v${version}/ALCOM-${version}-universal.dmg`;
        const windowsLink = `https://github.com/vrc-get/vrc-get/releases/download/gui-v${version}/ALCOM-${version}-x86_64-setup.nsis.zip`;
        const windowsStandaloneLink = `https://github.com/vrc-get/vrc-get/releases/download/gui-v${version}/ALCOM-${version}-x86_64.exe`;
        const linuxLink = `https://github.com/vrc-get/vrc-get/releases/download/gui-v${version}/alcom-${version}-x86_64.AppImage`;

        document.getElementById('btn-download-windowsSetup').href = windowsLink;
        document.getElementById('btn-download-windowsStandalone').href = windowsStandaloneLink;
        document.getElementById('btn-download-macOS').href = macLink;
        document.getElementById('btn-download-linux').href = linuxLink;

        const mainButton = document.getElementById('btn-download-main');
        const mainButtonIcon = document.getElementById('btn-download-main-platform');
        const mainButtonVersion = document.getElementById('btn-download-main-version');
        const mainButtonDropdown = document.getElementById('btn-download-main-dropdown');
        const mainButtonContainer = document.getElementById('btn-download-main-container');

        function updateMainButton(link, icon) {
            mainButtonIcon.classList.add(`ri-${icon}`);
            mainButtonVersion.innerText = version;
            _mainButtonLink = link;
        }
        async function invalidateDownloadButton() {
            mainButton.setAttribute('disabled', 'disabled');
            mainButtonDropdown.setAttribute('disabled', 'disabled');
            await waitUntilLocaleIsLoaded();
            document.getElementById('btn-download-main-text').innerText = S.downloads.unsuportedOS;
        }
        switch (detectPlatform()) {
            case 'macOS':
                updateMainButton(macLink, 'apple-line');
                break;
            case 'Windows':
                updateMainButton(windowsLink, 'windows-line');
                break;
            case 'Linux':
                updateMainButton(linuxLink, 'ubuntu-line');
                break;
            case 'Android':
                updateMainButton(null, 'android-line');
                await invalidateDownloadButton();
                break;
            case 'iOS':
                updateMainButton(null, 'apple-line');
                await invalidateDownloadButton();
                break;
            default:
                // ToDo: Add disabled button for unsupported devices (with tooltip)
                updateMainButton(null, 'question-mark');
                await invalidateDownloadButton();
                break;
        }

        loadingButton.setAttribute('hidden', null);
        mainButton.removeAttribute('hidden');
        mainButtonDropdown.removeAttribute('hidden');
        mainButtonContainer.classList.add('me-2');
    } catch (e) {
        console.error(e);
        loadingButton.setAttribute('hidden', null);
        errorButton.removeAttribute('hidden');
        errorNotification.removeAttribute('hidden');
    }
}

init();