class Release {
    name = '';
    displayName = '';
    downloads = [];
    isGui = false;
}

async function loadReleases() {
    const cacheKey = 'vrc-get/releases';
    // Check if cached result exists and is not expired
    const cachedResult = JSON.parse(localStorage.getItem(cacheKey));
    if (cachedResult?.timestamp && Date.now() - cachedResult.timestamp < 1800000) { // 30 minutes = 1800 seconds = 1,800,000 milliseconds
        console.info('Got releases from cache instead of API.')
        return cachedResult.data;
    }

    // If not cached or expired, fetch from GitHub
    try {
        let releases = [];
        let page = 1;
        while (true) {
            const response = await fetch(`https://api.github.com/repos/vrc-get/vrc-get/releases?per_page=100&page=${page}`);
            if (!response.ok) {
                document.getElementById('err-failedToLoadReleases').removeAttribute('hidden');
                if (response.status == 403) {
                    await waitUntilLocaleIsLoaded();
                    throw new Error(window.S.errors.githubApiTimeout);
                } else {
                    console.error(response);
                    throw new Error(`GitHub API returned status ${response.status}: ${releases.message}`);
                }
            }
            console.log(response);
            const json = await response.json();
            console.log(json);
            releases = releases.concat(json);
            if (json.length != 100) break;
            page = page + 1;
        }

        releases = releases.sort((a, b) => b.id - a.id);
        let items = [];
        releases.forEach(r => {
            const release = new Release();
            release.name = r.tag_name;
            release.isGui = r.tag_name.startsWith('gui-');
            release.displayName = r.tag_name.substring(release.isGui ? 5 : 1);
            release.downloads = [];
            r.assets.forEach(a => {
                release.downloads.push({
                    name: a.name,
                    link: a.browser_download_url,
                    sie: a.size,
                });
            });
            items.push(release);
        });

        // Store result in localStorage with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
            data: items,
            timestamp: Date.now()
        }));

        return JSON.parse(localStorage.getItem(cacheKey)).data;
    } catch (error) {
        document.getElementById('err-failedToLoadReleases').removeAttribute('hidden');
        throw error; // Re-throw error so calling code can handle it
    }
}
