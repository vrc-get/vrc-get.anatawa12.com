function detectPlatform() {
    const platform = window.navigator?.userAgentData?.platform || window.navigator.platform;

    if (platform.toLowerCase().indexOf('mac') !== -1) {
        return 'macOS';
    } else if (platform.toLowerCase().indexOf('win') !== -1) {
        return 'Windows';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    } else {
        return 'Windows';
    }
}

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

        let link;
        let icon;
        switch (detectPlatform()) {
            case 'macOS':
                link = macLink;
                icon = 'apple';
                break;
            default:
            case 'Windows':
                link = windowsLink;
                icon = 'windows';
                break;
            case 'Linux':
                link = linuxLink;
                icon = 'ubuntu';
                break;
        }
        mainButtonIcon.classList.add(`ri-${icon}-line`);
        mainButtonVersion.innerText = version;
        mainButton.href = link;

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