const parserMap = new Map();
parserMap.set('old', oldDesignParser);
parserMap.set('new', newDesignParser);

export function parser(designStyle) {
    let trackList = null;

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
            getParser(designStyle)(newTracks);
        }
    });

    observer.observe(trackList, {
        childList: true,
        subtree: true,
    });

    return observer;
}

function getParser(designStyle) {
    return parserMap.get(designStyle);
}

function oldDesignParser(newNodes) {
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
                        createTrackPlayCountElementOld(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        }
    });
}

/**
 * Create an playcount element for track
 * Used for old Yandex Music design
 * @param {string} playCount playCount
 * @returns {HTMLDivElement}
 */
function createTrackPlayCountElementOld(playCount) {
    const playCountElement = document.createElement('div');
    playCountElement.className = 'd-track__quasistatic-column';

    const nameElement = document.createElement('div');
    nameElement.className = 'd-track__name';
    nameElement.title = 'Save Me feat. Helene';

    const playCountText = document.createElement('span');
    playCountText.className = 'd-track__title';
    playCountText.style.color = '#777';
    playCountText.textContent = playCount;

    nameElement.appendChild(playCountText);
    playCountElement.appendChild(nameElement);

    return playCountElement;
}

function newDesignParser(newNodes) {
    // TODO
}
