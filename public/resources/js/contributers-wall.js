async function getContributors() {
    const cacheKey = 'vrc-get/contributors';
    const cachedResult = JSON.parse(localStorage.getItem(cacheKey));

    // Check if cached result exists and is not expired
    if (cachedResult && Date.now() - cachedResult.timestamp < 1800000) { // 30 minutes = 1800 seconds = 1,800,000 milliseconds
        console.info('Got contributers from cache instead of API.')
        return cachedResult.data;
    }

    // If not cached or expired, fetch from GitHub
    try {
        const response = await fetch(`https://api.github.com/repos/vrc-get/vrc-get/contributors`);
        const contributors = await response.json();

        if (response.status == 403) {
            await waitUntilLocaleIsLoaded();
            throw new Error(window.S.errors.githubApiTimeout);
        }

        if (!response.ok) {
            throw new Error(`GitHub API returned status ${response.status}: ${contributors.message}`);
        }

        // Store result in localStorage with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
            data: contributors,
            timestamp: Date.now()
        }));

        return contributors;
    } catch (error) {
        throw error; // Re-throw error so calling code can handle it
    }
}

async function makeWall() {
    try {
        const contributorsWall = document.getElementById('contributors');

        const contributors = (await getContributors('vrc-get', 'vrc-get')).sort(c => c.conributions);

        contributorsWall.innerHTML = '';
        for (const index in contributors) {
            const contributor = contributors[index];

            let element = document.createElement('a');
            element.classList.add('p-logo-section__item');
            element.classList.add('p-tooltip--btm-center');
            element.classList.add('contributor-icon');
            element.setAttribute('aria-describedby', `contributor-tooltip-${contributor.id}`)
            element.href = contributor.html_url;
            element.target = '_blank';
            contributorsWall.appendChild(element);

            let tooltip = document.createElement('span');
            tooltip.classList.add('p-tooltip__message');
            tooltip.setAttribute('role', 'tooltip');
            tooltip.id = `contributor-tooltip-${contributor.id}`;
            tooltip.innerText = contributor.login;
            element.appendChild(tooltip);

            let imageElement = document.createElement('img');
            imageElement.classList.add('contributor-icon');
            imageElement.src = contributor.avatar_url;
            imageElement.alt = contributor.login;
            element.appendChild(imageElement);
        }

        document.getElementById('contributors-cache').classList.remove('hidden');
    }
    catch (e) {
        document.getElementById('contributors-placeholder').remove();
        document.getElementById('contributors-error').removeAttribute('hidden');
        document.getElementById('contributors-error-msg').innerText = e.message;
        console.error(e);
    }
}
makeWall();