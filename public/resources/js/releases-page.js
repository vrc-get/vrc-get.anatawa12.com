async function buildReleasesPage(withGui) {
    const list = document.getElementById('releases-list');
    const releases = await loadReleases();
    await waitUntilLocaleIsLoaded();
    releases.forEach(r => {
        if (r.isGui != withGui) return;

        const item = document.createElement('li');
        item.classList.add('accordion__group');
        list.appendChild(item);

        // Body
        const body = document.createElement('section');
        body.classList.add('p-accordion__panel');
        body.setAttribute('aria-hidden', 'true');

        // Header
        const header = document.createElement('h4');
        header.setAttribute('role', 'heading');
        header.setAttribute('aria-level', '3');
        header.classList.add('p-accordion__heading');
        item.appendChild(header);
        item.appendChild(body);

        const headerButton = document.createElement('button');
        headerButton.classList.add('p-accordion__tab');
        headerButton.setAttribute('aria-expanded', 'false')
        headerButton.addEventListener('click', () => {
            const isHidden = body.getAttribute('aria-hidden') === 'true';
            body.setAttribute('aria-hidden', !isHidden);
            headerButton.setAttribute('aria-expanded', isHidden);
            if (isHidden) {
                body.classList.add('my-1');
            } else {
                body.classList.remove('my-1');
            }
        });
        headerButton.innerText = r.displayName;
        header.appendChild(headerButton);

        let isFirstDownload = true;
        r.downloads.forEach(d => {
            if ( ! r.isGui && d.name.endsWith('.d')) return;

            // Seperator
            if (isFirstDownload) {
                isFirstDownload = false;
            } else {
                const seperator = document.createElement('hr');
                seperator.classList.add('is-muted');
                seperator.classList.add('my-1');
                body.appendChild(seperator);
            }

            // Container
            const container = document.createElement('div');
            container.classList.add('flex');
            body.appendChild(container);

            // Name
            const nameContainer = document.createElement('div');
            nameContainer.classList.add('flex-grow');
            container.appendChild(nameContainer);

            const code = document.createElement('code');
            code.innerText = d.name;
            nameContainer.appendChild(code);

            // Download
            const linkContainer = document.createElement('div');
            linkContainer.classList.add('flex-shrink');
            container.appendChild(linkContainer);

            const link = document.createElement('a');
            link.setAttribute('href', d.link);
            link.innerText = window.S.common.download;
            linkContainer.appendChild(link);
        });
    });

    document.getElementById('releases-spinner').setAttribute('hidden', 'hidden');
    document.getElementById('releases-cache').classList.remove('hidden');
    list.parentElement.removeAttribute('hidden');
}