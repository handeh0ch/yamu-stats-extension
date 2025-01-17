const observersMap = new Map();

function handleUrlChange(url) {
    if (url.match(/\/users\/.*\/tracks/)) {
        updateObserverInstance('tracks', getTrackListObserver);
    }

    if (url.match(/\/album\/\d+/)) {
        console.log('Parsing album for: ', url);
    }

    if (url.match(/\/artist\/\d+/)) {
        console.log('Parsing artist for: ', url);

        if (url.match(/\/artist\/\d+\/tracks/)) {
        }
    }
}

function updateObserverInstance(key, observer) {
    observersMap.get(key)?.disconnect();
    observersMap.delete(key);
    observersMap.set(key, observer());
}

function getTrackListObserver() {
    let trackList = document.querySelector('.lightlist__cont');

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    const trackSet = new WeakSet();

    const observer = new MutationObserver((mutations) => {
        const newTracks = [];

        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).forEach((node) => {
                if (node.nodeType === 1 && !trackSet.has(node)) {
                    trackSet.add(node);
                    newTracks.push(node);
                }
            });
        });

        if (newTracks.length > 0) {
            parseTracks(newTracks);
        }
    });

    observer.observe(trackList, {
        childList: true,
        subtree: true,
    });

    return observer;
}

function parseTracks(newNodes) {
    newNodes.forEach((node) => {
        const name = node.querySelector('.d-track__title')?.textContent.trim();
        const artist = node.querySelector('.d-track__artists > a')?.textContent.trim();

        if (name && artist) {
            fetch(`https://yamu-stats-extension-api.vercel.app/api/track?artist=${artist}&name=${name}&service=lastfm`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data :(';
                    }

                    node.insertBefore(
                        createTrackPlayCountElement(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        }
    });
}

function createTrackPlayCountElement(playCount) {
    const trackElement = document.createElement('div');
    trackElement.className = 'd-track__quasistatic-column';

    const nameElement = document.createElement('div');
    nameElement.className = 'd-track__name';
    nameElement.title = 'Save Me feat. Helene';

    const playCountText = document.createElement('span');
    playCountText.className = 'd-track__title';
    playCountText.style.color = 'gray';
    playCountText.textContent = playCount;

    nameElement.appendChild(playCountText);
    trackElement.appendChild(nameElement);

    return trackElement;
}

(function bootstrap() {
    let currentUrl = null;

    const observer = new MutationObserver(() => {
        if (location.href !== currentUrl) {
            handleUrlChange(location.href);
            currentUrl = location.href;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
