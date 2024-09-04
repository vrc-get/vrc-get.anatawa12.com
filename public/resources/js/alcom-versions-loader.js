const loadingButton = document.getElementById('btn-download-loading');

const windowsLink = document.getElementById('btn-download-windowsSetup').href;
const macLink = document.getElementById('btn-download-macOS').href;
const linuxLink = document.getElementById('btn-download-linux').href;

const mainButton = document.getElementById('btn-download-main');
const mainButtonIcon = document.getElementById('btn-download-main-platform');
const mainButtonContainer = document.getElementById('btn-download-main-container');

function updateMainButton(link, icon) {
    mainButtonIcon.classList.add(`ri-${icon}`);
    mainButton.onclick = () => { window.location.href = link; };
}
async function invalidateDownloadButton() {
    mainButton.setAttribute('disabled', 'disabled');
    document.getElementById('btn-download-main-unsupported').removeAttribute('hidden');
    document.getElementById('btn-download-main-text').setAttribute('hidden', null);
}
switch (PLATFORMS.current) {
    case PLATFORMS.macOS:
        updateMainButton(macLink, 'apple-line');
        break;
    case PLATFORMS.windows:
        updateMainButton(windowsLink, 'windows-line');
        break;
    case PLATFORMS.linux:
        updateMainButton(linuxLink, 'ubuntu-line');
        break;
    case PLATFORMS.android:
        updateMainButton(null, 'android-line');
        invalidateDownloadButton();
        break;
    case PLATFORMS.iOS:
        updateMainButton(null, 'apple-line');
        invalidateDownloadButton();
        break;
    default:
        updateMainButton(null, 'question-mark');
        invalidateDownloadButton();
        break;
}

loadingButton.setAttribute('hidden', null);
mainButton.removeAttribute('hidden');
mainButtonContainer.classList.add('me-2');